from pathlib import Path
import types
import subprocess
import importlib.machinery
import saspy

# from saspy import SAScfg


def get_base_path(origin):
    """
    Find the base bath based on jupyter server or jupyter notebook output
    """
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

def local_cfg():
    l_cfg = False
    if (Path('.') / "sascfg_personal.py").exists():
        l_cfg = True
    return l_cfg

def SAScfg_path():
    return saspy.SAScfg

def list_configs():
    return saspy.list_configs()

def get_config():
    """
    get the config file used by SASPy
    """
    loader = importlib.machinery.SourceFileLoader('foo', saspy.SAScfg)
    #  TODO: figure out why the local directory isn't included in saspy.SAScfg
    # This shouldn't be needed but SASPy wasn't finding the local config file
    if local_cfg():
        loader = importlib.machinery.SourceFileLoader('foo', str(Path('.') / "sascfg_personal.py"))    
    cfg = types.ModuleType(loader.name)
    loader.exec_module(cfg)
    # Look through the configs to see if one is stdio
    return cfg.SAS_config_names

def get_config_stdio():
    """
    get the config file used by SASPy
    """
    loader = importlib.machinery.SourceFileLoader('foo', saspy.SAScfg)
    # This shouldn't be needed but SASPy wasn't finding the local config file
    if local_cfg():
        loader = importlib.machinery.SourceFileLoader('foo', str(Path('.') / "sascfg_personal.py"))    
    cfg = types.ModuleType(loader.name)
    loader.exec_module(cfg)
    # Look through the configs to see if one is stdio
    return [c for c in cfg.SAS_config_names if 'saspath' in cfg.__dict__[c].keys() and 'ssh' not in cfg.__dict__[c].keys()]

# def run_profile(cfgname):
#     # cfgname = get_config
#     # if len(cfgname) > 0:
#     _sas = saspy.SASsession(cfgname=cfgname[0])
#     full_path = Path(base_path) / input_data["fpath"]
#     _sas.saslib('_temp', path=str(full_path.parent))
#     _data = _sas.sasdata(full_path.stem, libref = '_temp')
#     _data.head()
#     _data.contents()
#     _data.means()

#     # _sas.endsas
