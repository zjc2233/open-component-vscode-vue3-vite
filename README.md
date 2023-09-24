# openComponent-vscode-vue3-vite
#### 介绍
vue3项目通过vscode打开对应的组件文件，快速定位组件文件


#### 安装教程
```
npm install -D openComponent-vscode-vue3-vite
```

#### 使用说明
1.  在vite.config.js中配置openComponent-vscode-vue3-vite的plugin
```
// vite.config.js
import openVscode from 'openComponent-vscode-vue3-vite';


export default defineApplicationConfig({
  overrides: {
    plugins: [
      process.env.NODE_ENV === 'development' && openVscode()
    ],
  },
});
```

2.  在main.js中注册对应的全局方法
```
import { createApp } from 'vue';

import App from './App.vue';

async function bootstrap() {
  const app = createApp(App);

  app.mount('#app');

  // 注册全局方法
  app.config.globalProperties.$openVscode = function (path) {
    // 在这里编写你的全局方法的逻辑
    window.open(path, '_self');
  };
}

bootstrap();
```

3.  在运行时环境通过shift + alt + 鼠标左键点击，打开对应的组件文件（后续会迭代为可配置按键）

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request

