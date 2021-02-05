# Jupyter Lab Extensions for SAS

This repo contains a set of Jupyter Lab extensions to improve the user experience for SAS programmers developing SAS code in Jupyter Lab.

If you have suggestions please enter an issue.

## List of Planned Extensions (in no particular order)

1. Display the SAS log
1. View the contents of a SAS library
1. Store SAS code snippets
1. Format code for .sas files
1. Format code for SAS kernel .ipynb files
1. Menu bar for SAS examples
1. View file contents (head, tail, or random)
1. Get data summary for data set

## List of Completed Extensions

1. Create a new SAS file (12/2020)
    * The file menu can be used to create a new SAS file in the current folder.
1. Convert a SAS file to a notebook (1/27/2021)
    * You can right click on a SAS file and it will create an ipynb of the same name for the SAS kernel. It will split based on data step and proc boundaries unless you have `/* ## % */` which will then split only on those boundaries. So if you want custom splitting just use the *magic* comment string

## SAS Kernel

This extension library has a dependency on the [SAS Kernel](https://github.com/sassoftware/sas_kernel) which has allowed SAS programmers to write SAS code from within Jupyter since 2016.

## Create a new extension

All of the extensions in this package were created using the jupyter lab cookiecutter

```bash
cookiecutter https://github.com/jupyterlab/extension-cookiecutter-ts
```
