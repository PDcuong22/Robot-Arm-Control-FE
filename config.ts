//config.ts

enum LayoutType {
  MIX = 'mix',
  TOP = 'top',
  SIDE = 'side',
}

const CONFIG = {
  appName: 'Robot Arm Control',
  helpLink: 'https://github.com/arifszn/reforge',
  enablePWA: true,
  theme: {
    accentColor: '#0850c4',
    sidebarLayout: LayoutType.MIX,
    showBreadcrumb: true,
  },
  metaTags: {
    title: 'Robot Arm Control',
    description:
      'An out-of-box UI solution for enterprise applications as a React boilerplate.',
    imageURL: 'logo.svg',
  },
};

export default CONFIG;
