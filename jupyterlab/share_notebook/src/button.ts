/* eslint-disable @typescript-eslint/no-unused-vars */
import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { requestAPI } from './handler';
import jwt_decode from 'jwt-decode';
import * as CryptoJS from 'crypto-js';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface _DecodeToken {
  userID: string;
  userType: string;
  // Add other properties of the token as needed
}

export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const mybutton = new ToolbarButton({
      label: 'Share Notebook',
      onClick: () => this.get_notebook(context)
    });

    const statusButton = new ToolbarButton({
      label: '',
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClick: () => {}
    });

    this.checkSystemStatus().then(status => {
      if (status === 'green') {
        statusButton.addClass('green-button');
        statusButton.node.title = 'System is fully operational';
        statusButton.node.textContent = 'System is fully operational';
      } else {
        statusButton.addClass('red-button');
        statusButton.node.title = 'System is not fully operational';
        statusButton.node.textContent = 'System is not fully operational';
      }
    });

    // Add the toolbar button to the notebook toolbar
    panel.toolbar.insertItem(10, 'mybutton', mybutton);
    panel.toolbar.insertItem(11, 'statusButton', statusButton);

    return new DisposableDelegate(() => {
      mybutton.dispose();
      statusButton.dispose();
    });
  }

  async createHash(input: string): Promise<string> {
    const hash = CryptoJS.SHA256(input);
    return hash.toString(CryptoJS.enc.Hex);
  }

  async fetchEditAccess(
    notebookId: string,
    userId: string,
    token: string
  ): Promise<boolean> {
    const response = await fetch(
      `http://localhost:3000/access/get-edit-access/${notebookId}/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include'
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.hasEditAccess;
    } else {
      const data = await response.json();
      console.error(
        'Failed to get the edit access from the server:',
        data.message
      );
      return false;
    }
  }

  async fetchToken() {
    try {
      const response = await fetch('http://localhost:3000/api/get-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        console.log('Token extracted from the server:', token);
        return token;
      } else {
        const data = await response.json();
        console.error('Failed to get the token from the server:', data.message);
      }
    } catch (error) {
      console.error('Error fetching the token from the server:', error);
    }
    return null;
  }

  async get_notebook(
    context: DocumentRegistry.IContext<INotebookModel>
  ): Promise<void> {
    // Get the notebook path from the context object
    const path = context.path;
    console.log(path);

    // Fetch the token
    const token = await this.fetchToken();
    console.log('Token fetched');

    // If a token is available, proceed with the request
    if (token) {
      const decodedToken: _DecodeToken = jwt_decode(token);
      const userId = decodedToken.userID;
      const userType = decodedToken.userType;
      console.log('userId', userId);
      console.log('userType', userType);

      // Store the userId in localStorage if userType is 'admin'
      if (userType === 'admin') {
        localStorage.setItem('adminUserId', userId);
      }

      // If the userType is 'admin', use the userId from localStorage
      // Otherwise, use the userId from the token
      const localStorageUserId = localStorage.getItem('adminUserId');
      const idForHash = localStorageUserId ? localStorageUserId : userId;

      const hash = await this.createHash(idForHash);
      const notebookId = `${path}_${hash}`;
      console.log('Notebook id', notebookId);
      if (userType === 'admin') {
        this.shareNotebook(path, token, userId, userType);
      } else {
        const hasEditAccess = await this.fetchEditAccess(
          notebookId,
          userId,
          token
        );
        if (hasEditAccess) {
          this.shareNotebook(path, token, userId, userType);
        } else {
          alert('You are not authorized to share the notebook.');
        }
      }
    } else {
      alert('You are not logged in. Please login to share the notebook.');
    }
  }

  createWebSocketConnection(token: string): WebSocket {
    const webSocketURL = 'ws://localhost:3000/ws';

    const socket = new WebSocket(webSocketURL);

    // Connection opened
    socket.addEventListener('open', (event: Event) => {
      console.log('WebSocket connection opened:', event);

      // Send the token to the server after establishing the WebSocket connection
      socket.send(JSON.stringify({ type: 'token', data: token }));
    });

    socket.addEventListener('error', event => {
      console.error('WebSocket open error:', event);
    });

    // Listen for messages
    socket.addEventListener('message', (event: MessageEvent) => {
      console.log('WebSocket message received:', event);

      // Handle WebSocket messages from the server
    });

    // Connection closed
    socket.addEventListener('close', (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event);
    });

    // Connection error
    socket.addEventListener('error', (event: Event) => {
      console.error('WebSocket connection error:', event);
    });

    return socket;
  }

  async checkSystemStatus(): Promise<string> {
    try {
      const serverResponse = await fetch(
        'http://localhost:3000/status/server-status',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );
      const serverStatus = await serverResponse.json();

      const vueResponse = await fetch(
        'http://localhost:3000/status/vue-status',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );
      const vueStatus = await vueResponse.json();
      console.log('Vue status:', vueStatus);

      if (serverStatus.status === 'running' && vueStatus.status === 'running') {
        return 'green';
      } else {
        return 'red';
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      return 'red';
    }
  }

  async shareNotebook(
    path: string,
    token: string,
    userId: string,
    userType: string
  ) {
    requestAPI<any>(`/api/contents/${path}`)
      .then(data => {
        this.send_data(data, token, userId, userType);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const socket = this.createWebSocketConnection(token);
      })
      .catch(reason => {
        console.error(
          `The tutorial_extension server extension appears to be missing.\n${reason}`
        );
      });
  }

  async send_data(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    dataToSend: any,
    token: string,
    userId: string,
    userType: string
  ): Promise<void> {
    // Include the owner's userId in the notebook JSON
    if (userType === 'admin') {
      dataToSend.owner = userId;
    } else {
      const ownerId = localStorage.getItem('adminUserId');
      dataToSend.owner = ownerId;
    }
    // dataToSend.owner = userId;
    console.log(dataToSend);
    console.log('Token in send_data:', token);
    fetch('http://localhost:3000/notebook', {
      body: JSON.stringify(dataToSend),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(result => {
        if (result.ok) {
          alert('Notebook was successfully shared.');
          return result.json();
        } else {
          throw new Error(`Error sharing notebook: ${result.statusText}`);
        }
      })
      .then(jsonformat => console.log(jsonformat))
      .catch(error => console.error('Error sending data:', error));
  }
}
