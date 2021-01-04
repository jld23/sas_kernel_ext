from ._version import __version__
from .handlers import setup_handlers
from .convertSAS2nb import sas2nb, convert, autoSplit


def _jupyter_server_extension_paths():
    return [{"module": "jl_sas_to_nb"}]

def load_jupyter_server_extension(lab_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    lab_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    setup_handlers(lab_app.web_app)
    lab_app.log.info("Registered Convert sas2nb extension at URL path /jl-sas-to-nb")
