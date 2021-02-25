import re
import json
import subprocess
import nbformat as nbf
from pathlib import Path

# TODO: overwrite isn't working properly
HEADER_COMMENT = "/* %% */\n"


def get_base_path(origin):
    try:
        process = subprocess.Popen(['jupyter', 'notebook', 'list'],
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        servers = stdout.decode("utf-8").split('\n')
        d = dict(x.split("::") for x in servers if x.startswith('http'))
        n_dict = {k.replace(' ', ''): v.replace(' ', '') for k, v in d.items()}

    except:
        n_dict = {}
    # print("n_dict", n_dict)

    try:
        process = subprocess.Popen(['jupyter', 'server', 'list'],
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        servers = stdout.decode("utf-8").split('\n')
        d = dict(x.split("::") for x in servers if x.startswith('http'))
        s_dict = {k.replace(' ', ''): v.replace(' ', '') for k, v in d.items()}
    except:
        s_dict = {}
    # print("s_dict", s_dict)
    s_dict.update(n_dict)
    # print("s_dict after update", s_dict)
    try:
        # print("path:", [v for k, v in s_dict.items() if k.startswith(origin)][0])
        # print("path type:", type([v for k, v in s_dict.items() if k.startswith(origin)][0]))
        return [v for k, v in s_dict.items() if k.startswith(origin)][0]
    except IndexError:
        return None


def auto_split(sas_str):
    regex_block = r"""
	((%macro\b|data\b|proc\b).*?(%mend\b.*?;|run;|quit;))
	"""
    subst = "/* %% */\\n\\1"
    regex_hc = r"""
               ^/\*\s%%\s\*/$
               """
    # Does the file already have cell seperators
    if re.search(regex_hc, sas_str, re.MULTILINE | re.IGNORECASE | re.VERBOSE | re.DOTALL):
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
        sas_str = sas_str[len(HEADER_COMMENT):]

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


def name_exist(fpath):
    print(fpath, fpath.with_suffix('.ipynb').exists())
    return fpath.with_suffix('.ipynb').exists()


def name_generator(in_file):
    print(in_file.stem)
    assert isinstance(in_file, Path)
    if not in_file.exists():
        print("file doesn't exist", in_file)
        return in_file
    m = re.search(r'.*-CovertedSAS(\d*)$', in_file.stem)
    print(in_file.stem)
    print("m.group=", m.group())
    index = 0
    if m is not None:
        print(m.group())
        index = m.group()
    print("index=", index)
    print(in_file)
    #in_file.rename(Path(in_file.parent, ''.join([in_file.stem, '-CovertedSAS', in_file.suffix])))
    if index > 0:
        pass
        #in_file.rename(Path(in_file.parent, ''.join([in_file.stem, '-CovertedSAS', str(int(index)+1), in_file.suffix])))
    # recursion
    if name_exist(in_file):
        name_generator(in_file)
    return in_file


def convert(in_file, out_file=None, overwrite=True):
    """
    function to convert SAS program to ipynb using special string values
    """
    assert isinstance(in_file, Path)

    if out_file is None:
        out_file = in_file.with_suffix('.ipynb')

    # check if out_file exists and if so, pick a new name
    if name_exist(out_file) and not overwrite:
        print("name exists")
        # get name
        print("outfile1", out_file)
        out_file = name_generator(out_file)
        print("outfile2", out_file)
    if in_file.suffix == ".sas" and out_file.suffix == ".ipynb":
        with open(in_file, "r", encoding="utf-8") as f:
            sas_str = f.read()
            nb_str = auto_split(sas_str)
        notebook = sas2nb(nb_str)
        # print(notebook)
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(notebook, f, indent=3)

    else:
        raise Exception("Extensions must be .ipynb and .sas")
    return out_file.name
