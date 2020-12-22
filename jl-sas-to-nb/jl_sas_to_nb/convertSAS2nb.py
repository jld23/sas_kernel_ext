import re
import json
from os import path
import nbformat as nbf


HEADER_COMMENT = "/* %% */\n"


def autoSplit(sas_str):
    regex_block = r"""
	((%macro\b|data\b|proc\b).*?(%mend\b.*?;|run;|quit;))
	"""
    subst = "/* %% */\\n\\1"
    regex_hc = r"""
               ^/\*\s%%\s\*/$
               """
    # Does the file already have cell seperators
    if re.search(
        regex_hc, sas_str, re.MULTILINE | re.IGNORECASE | re.VERBOSE | re.DOTALL
    ):
        return sas_str
    # separate every macro, proc and data step
    return re.sub(
        regex_block,
        subst,
        sas_str,
        0,
        re.MULTILINE | re.IGNORECASE | re.VERBOSE | re.DOTALL,
    )


def sas2nb(sas_str):
    """
    convert SAS file to ipynb
    """
    # remove leading header comment
    if sas_str.startswith(HEADER_COMMENT):
        sas_str = sas_str[len(HEADER_COMMENT) :]

    # cells = []
    chunks = sas_str.split("\n\n%s" % HEADER_COMMENT)
    nb = nbf.v4.new_notebook()
    nb["metadata"] = {
        "kernelspec": {"display_name": "SAS", "language": "sas", "name": "sas"},
        "language_info": {
            "codemirror_mode": "sas",
            "file_extension": ".sas",
            "mimetype": "text/x-sas",
            "name": "sas",
        },
    }
    for chunk in chunks:
        # cell_type = 'code'
        if chunk.startswith("comment"):
            nb["cells"].append(nbf.v4.new_markdown_cell(chunk))
        else:
            nb["cells"].append(nbf.v4.new_code_cell(chunk))
    return nb


def convert(in_file, out_file=None):
    """
    function to convert SAS program to ipynb using special string values
    """

    fname, in_ext = path.splitext(in_file)
    if out_file is None:
        out_file = ".".join([fname, "ipynb"])

    _, out_ext = path.splitext(out_file)

    if in_ext == ".sas" and out_ext == ".ipynb":
        with open(in_file, "r", encoding="utf-8") as f:
            sas_str = f.read()
            nb_str = autoSplit(sas_str)
        notebook = sas2nb(nb_str)
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(notebook, f, indent=2)

    else:
        raise Exception("Extensions must be .ipynb and .sas")
