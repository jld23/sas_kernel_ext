# sas_log_viewer_v3

![Github Actions Status](https://github.com/jld23/sas_kernel_ext/workflows/Build/badge.svg)

View SAS Log in seperate window


This extension is composed of a Python package named `sas_log_viewer_v3`
for the server extension and a NPM package named `sas_log_viewer_v3`
for the frontend extension.


## Requirements

* JupyterLab >= 3.0

## Install

```bash
pip install sas_log_viewer_v3
```


## Troubleshoot

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```


## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the sas_log_viewer_v3 directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Uninstall

```bash
pip uninstall sas_log_viewer_v3
```

## TODO

1. Create icon only in SAS Kernel notebook
1. On click of button create new window
1. register a listener to the state of the kernel window
1. on statechange, submit %showLog to the kernel
1. Update the window with the results
