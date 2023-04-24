/* eslint-disable @typescript-eslint/no-unused-vars */
import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { IDisposable } from '@lumino/disposable';
import { requestAPI } from './handler';
import jwt_decode from 'jwt-decode';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface _DecodeToken {
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
    // this.sendMockRequest();
    setTimeout(() => {
      this.sendMockRequest().catch(err => {
        console.error('Error sending mock request:', err);
      });
    }, 10000);

    const mybutton = new ToolbarButton({
      label: 'Share Notebook',
      onClick: () => this.get_notebook(context)
    });

    // Add the toolbar button to the notebook toolbar
    panel.toolbar.insertItem(10, 'mybutton', mybutton);

    // The ToolbarButton class implements `IDisposable`, so the
    // button *is* the extension for the purposes of this method.

    // console.log('get notebook executed', this.get_notebook(context));
    // this.openWebSocket(context);
    // console.log('web socket opened');
    return mybutton;
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

  async sendMockRequest() {
    try {
      const response = await fetch('http://localhost:3000/api/ping', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        console.log('Mock request succeeded');
      } else {
        console.error('Mock request failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending mock request:', error);
    }
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
      const userType = decodedToken.userType;
      console.log('userType', userType);
      if (userType === 'admin') {
        requestAPI<any>(`/api/contents/${path}`)
          .then(data => {
            this.send_data(data, token);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const socket = this.createWebSocketConnection(token);
          })
          .catch(reason => {
            console.error(
              `The tutorial_extension server extension appears to be missing.\n${reason}`
            );
          });
      } else {
        alert('You are not authorized to share the notebook.');
      }
    } else {
      console.error('Failed to fetch token');
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

  async send_data(dataToSend: JSON, token: string): Promise<void> {
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
      .then(result => result.json())
      .then(jsonformat => console.log(jsonformat))
      .catch(error => console.error('Error sending data:', error));
  }
}
