import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { IDisposable } from '@lumino/disposable';
import { requestAPI } from './handler';

export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    // Create the toolbar button
    // const mybutton = new ToolbarButton({
    //   label: 'Share Notebook',
    //   onClick: () => this.get_notebook()
    // });

    const mybutton = new ToolbarButton({
      label: 'Share Notebook',
      onClick: () => this.get_notebook(context)
    });

    // Add the toolbar button to the notebook toolbar
    panel.toolbar.insertItem(10, 'mybutton', mybutton);

    // The ToolbarButton class implements `IDisposable`, so the
    // button *is* the extension for the purposes of this method.
    return mybutton;
  }

  // get_notebook(): void {
  //   // This is an example API call to the server extension associated with
  //   // this jupyterlab extension. It uses the generated handler.ts utility
  //   const url = window.location.href;
  //   const lastSegment = url.split('/').pop();
  //   requestAPI<any>(`/api/contents/${lastSegment}`)
  //     .then(data => {
  //       this.send_data(data);
  //       // console.log('tu');
  //       // console.log(data);
  //     })
  //     .catch(reason => {
  //       console.error(
  //         `The tutorial_extension server extension appears to be missing.\n${reason}`
  //       );
  //     });
  // }

  // get_notebook(): void {
  //   const path = window.location.pathname.split('/');
  //   const lastSegment = path.pop();
  //   const basePath = path.join('/');

  //   requestAPI<any>(`${basePath}/api/contents/${lastSegment}`)
  //     .then(data => {
  //       this.send_data(data);
  //     })
  //     .catch(reason => {
  //       console.error(
  //         `The tutorial_extension server extension appears to be missing.\n${reason}`
  //       );
  //     });
  // }

  get_notebook(context: DocumentRegistry.IContext<INotebookModel>): void {
    // Get the notebook path from the context object
    const path = context.path;
    console.log(path);
    requestAPI<any>(`/api/contents/${path}`)
      .then(data => {
        this.send_data(data);
      })
      .catch(reason => {
        console.error(
          `The tutorial_extension server extension appears to be missing.\n${reason}`
        );
      });
  }

  send_data(dataToSend: JSON): void {
    console.log(dataToSend);
    fetch('http://localhost:3000/notebook', {
      body: JSON.stringify(dataToSend),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(result => result.json())
      .then(jsonformat => console.log(jsonformat));
  }
}
