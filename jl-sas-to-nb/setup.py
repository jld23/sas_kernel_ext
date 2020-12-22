"""
Setup Module to setup Python Handlers for the jl-sas-to-nb extension.
"""
import os
from setuptools import setup
from os import path
import io

from jupyter_packaging import (
    create_cmdclass, install_npm, ensure_targets,
    combine_commands, get_version,
)
import setuptools

HERE = os.path.abspath(os.path.dirname(__file__))

# The name of the project
name="jl_sas_to_nb"

# Get our version
version = get_version(os.path.join(name, "_version.py"))

lab_path = os.path.join(HERE, name, "labextension")

# Representative files that should exist after a successful build
jstargets = [
    os.path.join(HERE, "lib", "jl-sas-to-nb.js"),
]

package_data_spec = {
    name: [
        "*"
    ]
}

data_files_spec = [
    ("share/jupyter/lab/extensions", lab_path, "*.tgz"),
    ("etc/jupyter/jupyter_notebook_config.d",
     "jupyter-config", "jl_sas_to_nb.json"),
]

cmdclass = create_cmdclass("jsdeps", 
    package_data_spec=package_data_spec,
    data_files_spec=data_files_spec
)

cmdclass["jsdeps"] = combine_commands(
    install_npm(HERE, build_cmd="build:all", npm=["jlpm"]),
    ensure_targets(jstargets),
)

with open("README.md", "r") as fh:
    long_description = fh.read()

setup_args = dict(
    name=name,
    version=version,
    url="https://github.com/jld23/sas_kernel_ext",
    author="Jared Dean",
    description="A Jupyter Lab extension to convert a sas file to a notebook using the SAS_kernel",
    long_description= long_description,
    long_description_content_type="text/markdown",
    cmdclass= cmdclass,
    packages=setuptools.find_packages(),
    install_requires=[
        "jupyterlab~=2.0",
    ],
    python_requires=">=3.5",
    zip_safe=False,
    include_package_data=True,
    license="BSD-3-Clause",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab", "SAS", "convert"],
    classifiers=[
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Framework :: Jupyter",
    ],
)


if __name__ == "__main__":
    setuptools.setup(**setup_args)
