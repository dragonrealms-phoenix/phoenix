import {
  REACT_DEVELOPER_TOOLS,
  installExtension,
} from 'electron-extension-installer';

// The recommended module for installing extensions for electron doesn't work.
// Using another one from the community.
// https://github.com/MarshallOfSound/electron-devtools-installer/issues/238#issuecomment-1499578154

export const installChromeExtensions = async (): Promise<void> => {
  await installReactDevTools();
};

export const installReactDevTools = async (): Promise<void> => {
  await installExtension(REACT_DEVELOPER_TOOLS, {
    loadExtensionOptions: {
      allowFileAccess: true,
    },
  });
};
