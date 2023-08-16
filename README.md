# JupDApp System Setup Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Hyperledger Fabric Setup](#hyperledger-fabric-setup)
- [Redis Installation](#redis-installation)
- [Hyperledger Fabric Network](#hyperledger-fabric-network)
- [ExpressJS Server Setup](#expressjs-server-setup)
- [Client Setup](#client-setup)
- [JupyterLab Extension Installation](#jupyterlab-extension-installation)
- [Python Server](#python-server)
- [Accessing JupDApp](#accessing-jupdapp)

## Prerequisites

1. Before installing the Hyperledger fabric binaries you will need to install the following prerequisites to be able to run a docker-based fabric test network. The installation steps for the prerequsities can be found on the following link: ![image](https://github.com/dlovric13/JupDApp/assets/47255927/814140a2-a3fe-4e27-b582-bc51f12e6e49)
 [here](https://hyperledger-fabric.readthedocs.io/en/release-2.4/prereqs.html).

2. Node is required for the Hyperledger fabric test network. This project used version `v16.20.1` which works with Hyperledger fabric `v2.4`. To install:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

## Hyperledger Fabric Setup

1. Clone the GitHub repository.

2. Navigate to `/decentralized-collaborative-digital-object-sharing-and-monitoring-system` directory to install the fabric binaries.

3. Install fabric binaries using:
   ```bash
   curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.4.6
   ```

## Redis Installation

1. After installation, the `fabric-samples` folder should be present within the `/decentralized-collaborative-digital-object-sharing-and-monitoring-system` directory. Next, install Redis:
   ```bash
   sudo apt-get install redis-server
   redis-cli ping
   ```
   If the response is `PONG`, Redis is successfully running.

## Hyperledger Fabric Network 

1. Navigate to `/decentralized-collaborative-digital-object-sharing-and-monitoring-system/network`.

2. Bring up the Hyperledger fabric network using:
   ```bash
   ./startNetwork.sh
   ```

## ExpressJS Server Setup

1. Navigate to `/decentralized-collaborative-digital-object-sharing-and-monitoring-system/backend` and enroll admin users to the Hyperledger fabric network:
   ```bash
   ./setupUsers.sh
   ```

2. After enrolling the admin users, set up the ExpressJS server:
   ```bash
   npm install
   npm run dev
   ```

## Client Setup

1. Navigate to `/client` and run:
   ```bash
   npm install 
   npm run serve
   ```

## JupyterLab Extension Installation

1. Install JupyterLab extension binaries. First, install conda. Go to the following page and download the installer: [Conda Install Guide](https://docs.conda.io/projects/conda/en/latest/user-guide/install/linux.html)

2. Execute the Miniconda shell script you've downloaded:
   ```bash
   bash Miniconda3-latest-Linux-x86_64.sh
   ```

3. Follow the prompts on the terminal to complete the installation. When asked whether to initialize Miniconda3 by running conda init, it is recommended to respond with "yes".

4. Close and reopen your terminal to ensure the changes are effective.

5. Create a new Conda environment named "jupyterlab-ext" with Python version 3.10.9:
   ```bash
   conda create --name jupyterlab-ext python=3.10.9
   ```

6. Once the environment is created, activate it using:
   ```bash
   conda activate jupyterlab-ext
   ```

7. Install JupyterLab within the conda environment:
   ```bash
   pip install jupyterlab
   ```

8. Change the current working directory to the `jupyterlab/share_notebook` directory. Replace "path/to" with the actual path to the directory:
   ```bash
   cd path/to/jupyterlab/share_notebook
   ```

9. Inside the `jupyterlab/share_notebook` directory, execute the command to install the extension in development mode:
   ```bash
   pip install -e .
   ```
This command installs the package in editable mode. Any changes to the source code will immediately affect the package without needing a reinstall.

10. The extension uses JupyterLab's extension building system. Use the following commands to install dependencies and build the extension:
    ```bash
    jlpm install
    jlpm build
    ```

11. Install the extension to your JupyterLab instance:
    ```bash
    jupyter labextension install .
    ```
 The above command tells JupyterLab to compile the extension and make it available to the JupyterLab application.
 
12. Rebuild JupyterLab to include the newly installed extension:
    ```bash
    jupyter lab build
    ```

13. Start JupyterLab and access your new extension:
    ```bash
    jupyter lab --ip 0.0.0.0
    ```
    You should now be able to see and use your extension in the JupyterLab interface.

## Python Server

1. Navigate to the `/decentralized-collaborative-digital-object-sharing-and-monitoring-system/python_scripts` directory and start the python server:
   ```bash
   python convert.py
   ```

## Accessing JupDApp

1. Now, all system dependencies, binaries, and functional components should be installed and running. Navigate to [http://localhost:8080](http://localhost:8080) to start using the JupDApp system.
