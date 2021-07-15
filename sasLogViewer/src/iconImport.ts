import { LabIcon } from '@jupyterlab/ui-components';

import sasSVGstr from '../style/icons/Jupyter_Log.svg';

export const sasLogViewer = new LabIcon({
    name: 'sasLogViewer:sas',
    svgstr: sasSVGstr
  });

export const sasLogIcon = new LabIcon({
    name: 'custom-ui-components:sasLog',
    svgstr: sasSVGstr
  });
