window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }

  // Importez ipcRenderer ici
  const { ipcRenderer } = require('electron');

  const startButton = document.getElementById('start-button');
  const repoInput = document.getElementById('repo-input');
  const commandInput = document.getElementById('command-input');
  const commandOutput = document.getElementById('command-output');

  startButton.addEventListener('click', () => {
    const repoURL = repoInput.value;
    const launchCommand = commandInput.value;

    // Envoyer les données au processus principal
    ipcRenderer.send('start-command', { repoURL, launchCommand });
  });

  ipcRenderer.on('command-output', (event, data) => {
    commandOutput.innerText += data;
  });

  ipcRenderer.on('command-error', (event, data) => {
    commandOutput.innerText += `Erreur: ${data}`;
  });

  ipcRenderer.on('command-exit', (event, code) => {
    commandOutput.innerText += `La commande a quitté avec le code ${code}`;
  });
});
