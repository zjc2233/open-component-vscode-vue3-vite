const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');
const os = require('os');

export default function openVscode() {
  return {
    name: 'open-vscode',
    transform(originCode, originMap, ast) {
      if (
        originMap.endsWith('.vue')
      ) {
        if (!originCode.includes('_withModifiers')) {
          originCode = originCode.replace(
            'openBlock as _openBlock',
            `withModifiers as _withModifiers, openBlock as _openBlock`,
          );
        }
        // 下面是通过AST对应的组件，然后给组件添加点击事件
        const ast = parser.parse(originCode, {
          sourceType: 'unambiguous',
        });
        traverse(ast, {
          FunctionDeclaration(path, state) {
            // 判断是render函数，对render函数进行处理
            if (
              path.node.id.name === '_sfc_render' &&
              path.node.body.body &&
              path.node.body.body.length
            ) {
              path.node.body.body.forEach((item) => {
                if (item.type === 'ReturnStatement') {
                  if (item.argument.expressions && item.argument.expressions.length) {
                    item.argument.expressions.forEach((expressionsItem) => {
                      if (expressionsItem.arguments && expressionsItem.arguments[1]) {
                        if (expressionsItem.arguments[1].type === 'ObjectExpression') {
                          // 判断是否存在click事件的数组，要是存在，则添加数组，否则，添加click事件
                          let hasClick = false,
                            hasIndex = 0,
                            hasArray = false;
                          expressionsItem.arguments[1].properties.forEach(
                            (propertiesItem, index) => {
                              if (propertiesItem.key.name === 'onClick') {
                                hasClick = true;
                                hasIndex = index;
                                // 判断是否是array（多个click事件）
                                if (propertiesItem.value.type === 'ArrayExpression') {
                                  hasArray = true;
                                }
                              }
                            },
                          );
                          let addNode = types.logicalExpression(
                            '||',
                            types.memberExpression(
                              types.identifier('_cache'),
                              types.numericLiteral(109),
                              true,
                            ),
                            types.assignmentExpression(
                              '=',
                              types.memberExpression(
                                types.identifier('_cache'),
                                types.numericLiteral(109),
                                true,
                              ),
                              types.callExpression(types.identifier('_withModifiers'), [
                                types.arrowFunctionExpression(
                                  [types.identifier('$event')],
                                  types.callExpression(
                                    types.memberExpression(
                                      types.memberExpression(
                                        types.identifier('_ctx'),
                                        types.identifier('$openVscode'),
                                      ),
                                      types.identifier('call'),
                                    ),
                                    [
                                      types.thisExpression(),
                                      types.stringLiteral(`vscode://file${os.type() == 'Windows_NT'? '/': ''}${originMap}`),
                                    ],
                                  ),
                                ),
                                types.arrayExpression([
                                  types.stringLiteral('shift'),
                                  types.stringLiteral('alt'),
                                ]),
                              ]),
                            ),
                          );
                          if (hasClick) {
                            try {
                              if (hasArray) {
                                // 要已经是数组的情况下，才能添加
                                expressionsItem.arguments[1].properties[hasIndex].value =
                                  types.arrayExpression(
                                    [
                                      ...expressionsItem.arguments[1].properties[hasIndex].value
                                        .elements,
                                    ],
                                    addNode,
                                  );
                              } else {
                                // 要不是数组的情况下，添加的为对应的value（也就是单个click值）
                                expressionsItem.arguments[1].properties[hasIndex] =
                                  types.objectProperty(
                                    types.identifier(`onClick`),
                                    types.arrayExpression(
                                      [expressionsItem.arguments[1].properties[hasIndex].value,
                                      addNode,]
                                    ),
                                  );
                              }
                            } catch (error) {
                              console.warn(error);
                            }
                          } else {
                            // 要是没有click事件的情况下，添加click事件
                            expressionsItem.arguments[1].properties.push(
                              types.objectProperty(
                                types.identifier(`onClick`),
                                addNode,
                              ),
                            );
                          }
                        }
                      }
                    });
                  }
                }
              });
            }
          },
        });
        const { code, map } = generate(ast);
        if (code.includes('vscode://file')) {
          return code;
        }
      }
      return originCode;
    },
  };
}
