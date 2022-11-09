import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
// import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ButtonExtension } from './button';

/**
 * Initialization data for the share_notebook extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'mybutton',
  autoStart: true,
  // optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd
    // settingRegistry: ISettingRegistry | null
  ) => {
    console.log('JupyterLab extension share_notebook is activated!');

    const buttonExtension = new ButtonExtension();
    app.docRegistry.addWidgetExtension('Notebook', buttonExtension);

    // Load the settings from schema/plugin.json
    // This can include adding commands to a context menu
    // if (settingRegistry) {
    //   settingRegistry
    //     .load(plugin.id)
    //     .then((settings: { composite: any }) => {
    //       console.log(
    //         'tutorial-extension settings loaded:',
    //         settings.composite
    //       );
    //     })
    //     .catch(reason => {
    //       console.error(
    //         'Failed to load settings for tutorial-extension.',
    //         reason
    //       );
    //     });
    // }
  }
};

export default plugin;
