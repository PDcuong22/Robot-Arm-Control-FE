import { webRoutes } from '../../routes/web';
import { BiHomeAlt2 } from 'react-icons/bi';
import Icon from '@ant-design/icons';

export const sidebar = [
  {
    path: webRoutes.dashboard,
    key: webRoutes.dashboard,
    name: 'Dashboard',
    icon: <Icon component={BiHomeAlt2} />,
  },
];
