![](./gifs/termaxLogo.png)

#### _Build Node CLI's in minutes_

Termax is a wrapper library around exec, execFile, fork and spawn child processes which allows you to call them sequentially.

## Features

- OS Fallbacks - Credits to [sindresorhus](https://github.com/sindresorhus)
- Built in spinner - Credits to [sindresorhus](https://github.com/sindresorhus)
- Built in error handling
- Themes and custom styling - Credits to [chalk](https://github.com/chalk)

## Table of Contents

1.  [About Termax](#about_termax)
    1.  [What does termax do?](#what_termax)
    2.  [Spinner limits](#spinner_limits)
    3.  [About termax wrappers](#tremax_wrappers)
2.  [Documentation](#documentation)
    1.  [Installation](#installation)
    2.  [Dependencies](#dependencies)
    3.  [Importing](#importing)
    4.  [tExec](#tExec)
    5.  [tExecFile](#tExecFile)
    6.  [tFork](#tFork)
    7.  [tSpawn](#tSpawn)
    8.  [Chain](#chain)
    9.  [Error Handling](#error_handling)
    10. [Configuration](#configuration)
3.  [Styling](#styling)
    1.  [Themes](#themes)
    2.  [Custom Styling](#custom_styling)

## [About Termax](#about_termax)

### What does termax do?

<a name="what_termax"></a>
If you ended up here, you might be wondering what is termax, and why would I ever use it? Well, simply put, termax allows you to use async child processes sequentially. Now you might be wondering why would I ever do that, I can just call synchronous contra parts to those child processes and solve the problem? You would be completely right! You can do that, and quite frankly it would be easier to do so. You can exchange exac for exacSync, spawn for spawnSync etc... If the user experience is of no concern to you, that would be a more preferable approach. But if user experience is something you are looking to maximize, then you're in a pickle. Spinners and such terminal animations won't work properly (maybe not even work) with a synchronous process.(More on that in [spinner limits section](#spinner_limits))
Additionally to that termax comes with built-in error handling, themes, styling and more to speed up your development time, so that you might focus on the meat and potatoes of your project.

### Spinner limits

<a name="spinner_limits"></a>
To put it as simple as possible, spinners need continues execution so they can be animated, they will continuously update what's printed on the terminal (till we stop them). Now JavaScript is single-threaded, so if we call exec or fork etc… As they are non-blocking they spawn a shell then execute the command within that shell, but leave the rest of the code to be executed (this includes the spinners), execSync, forkSync etc... are blocking, which means that this method will not return until the child process has fully closed (effectively stopping the spinner execution till then).

That's why synchronous operations lead to spinner freezing, glitching etc…

Now if we execute asynchronous operations(such as exec, execFile, fork and spawn) sequentially, we can still preserve the order of operations, but keep the spinner going continuously for each operation. Which is essentially what termax does..(More on that in [about termax wrappers section](#tremax_wrappers)).

### About termax wrappers

<a name="tremax_wrappers"></a>
Asynchronous operations are awesome, they allow you to minimize the execution time of your code significantly, by both allowing multiple operation to run at the same time and allowing the execution flow to continue! But they are situations when this is not an ideal approach(All tools have, their purpose), as explained in [spinner limits section](#spinner_limits).
All four teramx wrappers (tExec, tExecFile, tFork, tSpawn) work pretty much the same way, the picture below will give a visual explanation:

![](./gifs/wrappers.png)

All four wrappers take two arguments, a mandatory configs argument which is an array of config objects (More on configs in [the configuration section](#configuration)), and an optional callback argument. Additionally, to callbacks, all wrappers have a executeState emitter which emits 'start' and 'done'. Example:

```javascript
tExec(calls).executeState.on('done', () => {
  console.log('done');
});

tExecFile(calls).executeState.on('done', () => {
  console.log('done');
});

tFork(calls).executeState.on('done', () => {
  console.log('done');
});

tSpawn(calls).executeState.on('done', () => {
  console.log('done');
});
```

### Wrapper limits and best practise

As termax wrappers are in fact asynchronous, it would be most beneficial to continue the execution flow ether on executeState 'done' or in a callback.
Calling any block of code after the wrapper will result in that code being executed parallel, the wrapper finishing its own execution.
Example case:

```javascript
tExec(calls).executeState.on('done', () => {
  console.log('done');
});

function demo() {
  for (let i = 0; i < 3; i++) {
    console.log('Code after');
  }
}

demo();
```

#### Output from the code above:

![](./gifs/flowExample.gif)

Executing the wrappers back to back will also lead to overlap, because they are both asynchronous, the picture below will give more context.

![](./gifs/wrappersOverlap.png)

Let's see it in example:

```javascript
tExec(calls).executeState.on('done', () => {
  console.log('Sleep done');
});

tExec(calls2).executeState.on('done', () => {
  console.log('Ping done');
});
```

#### Output from the code above:

![](./gifs/flowExample2.gif)

In case you would like to call multiple wrappers, you best use a chain(more on chain in [chain section](#chain)). This will allow you to bypass this issue, plus chain will also provide you with callback functionality, so you might be able to continue your execution flow properly.

## [Documentation](#documentation)

<a name="documentation"></a>

### Installation

<a name="installation"></a>

```sh
npm install --save @dynamize/termax
```

### Dependencies

<a name="dependencies"></a>

| Dependency  | README                                                     |
| ----------- | ---------------------------------------------------------- |
| chalk       | [https://github.com/chalk/chalk#readme][PlDb]              |
| inquirer    | [https://github.com/SBoudrias/Inquirer.js#readme][PlGh]    |
| log-symbols | [https://github.com/sindresorhus/log-symbols#readme][PlGd] |
| ora         | [https://github.com/sindresorhus/ora#readme][PlOd]         |

### Importing

<a name="importing"></a>

```javascript
import {tExec, tExecFile, tFork, tSpawn} from '@dynamize/termax';
```

#### Teramx only supports ECMAScript imports, and has no support for CommonJS.

#### Which means you need to setup your project with the type of a module in package.json:

![](./gifs/package.json.png)

### tExec

<a name="tExec"></a>

tExec is a wrapper around exec from child_process, with the nuance that it can execute a sequence of exec calls. This is useful when one wants to execute multiple exec call in an order and have a spinner working on each call without pauses.
Let's see a simple usage case:

```javascript
import {tExec} from '@dynamize/termax';

tExec([{cmd: 'sleep 3'}]);
```

This will execute a simple sleep command for 3 seconds, the style will fall back to default as we didn't specify it (more on styling in styling section).
tExec takes two arguments, a configs(array of config objects) argument and an optional callback. The only must is a cmd property in the config argument. (More on config in config section).

Let's take a look at a callback example:

```javascript
import {tExec} from '@dynamize/termax';

const calls = [
  {
    cmd: 'sleep 3'
  },
  {
    cmd: 'sleep 3',
    spinner: {
      style: 'cold'
    }
  },
  {
    cmd: 'sleep 3',
    spinner: {
      style: 'sunrise'
    }
  }
];

tExec(calls, () => {
  console.log('All done!');
});
```

#### Output from the code above:

![](./gifs/termaxExample1.gif)

### tExecFile

<a name="tExecFile"></a>

tExecFile is a wrapper around execFile from child_process, it takes two arguments: configs(array of config objects) and the optional callback function. What is always required is the cmd and args properties in configs argument, where cmd is an environment in which to execute the file (node, python etc...), and args will take the file name. Let's see an example:

```javascript
import {tExecFile} from '@dynamize/termax';

const calls = [
  {
    cmd: 'node',
    args: ['./example.js']
  },
  {
    cmd: 'node',
    args: ['./example.js'],
    spinner: {
      style: 'cold'
    }
  },
  {
    cmd: 'node',
    args: ['./example.js'],
    spinner: {
      style: 'sunrise'
    }
  }
];

tExecFile(calls, () => {
  console.log('All Done');
});
```

example.js

```javascript
import {exec} from 'child_process';

exec('ping 8.8.8.8 -c 4');
```

#### Output from the code above:

![](./gifs/termaxExample2.gif)

### tFork

<a name="tFork"></a>

tFork is a wrapper around fork from child_process, it also takes two arguments configs(array of config objects) and an optional callback function, with the only required property in configs being cmd, which will take the name of the file to be executed. Example:

```javascript
import {tFork} from '@dynamize/termax';

const calls = [
  {
    cmd: './test.js'
  },
  {
    cmd: './test.js',
    spinner: {
      style: 'cold'
    }
  },
  {
    cmd: './test.js',
    spinner: {
      style: 'sunrise'
    }
  }
];

tFork(calls, () => {
  console.log('All Done');
});
```

example.js

```javascript
import {exec} from 'child_process';

exec('ping 8.8.8.8 -c 4');
```

#### Output from the code above:

![](./gifs/termaxExample3.gif)

### tSpawn

<a name="tSpawn"></a>
tSpawn is a wrapper around spawn from child_process, like all other termax wrappers. It also takes two arguments, configs(array of config objects) and an optional callback function, and it always requires the cmd and args properties. Example:

```javascript
import {tSpawn} from '@dynamize/termax';

const calls = [
  {
    cmd: 'sleep',
    args: ['3']
  },
  {
    cmd: 'slep',
    args: ['3'],
    spinner: {
      style: 'sunrise'
    }
  },
  {
    cmd: 'sleep',
    args: ['3'],
    spinner: {
      style: 'vivid'
    }
  }
];

tSpawn(calls, () => {
  console.log('All Done');
});
```

#### Output from the code above:

![](./gifs/termaxExample1.gif)

### Chain

<a name="chain"></a>

### Chain API

| Name         | Description                                                                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| addToChain   | Method which adds an execution sequence to chain takes three arguments: child process name (type string), configs(config array) and an optional callback function |
| isExecuting  | A getter which returns a boolean                                                                                                                                  |
| executeChain | Method which executes a chain.                                                                                                                                    |
| callback     | A setter which sets a callback to be executed at the end of the chain                                                                                             |

### Chain Use Case

Chain is a class allowing you to chain together multiple different execution sequences. Let's say you want to execute three commands in a sequence, and you choose tSpawn to do so, but then you would like to execute a file(maybe generated by one of the commands), now if you try to call tSpawn and right under it tFork, both these will start to execute almost simultaneously. The reason being that each execution in both tSpawn and tFork are asynchronous and as such, they will execute side by side there for both execution sequence of tSpawn and tFork will execute side by side. Chain fixes this by allowing to chain together these execution sequences. Let's see this in an example:

```javascript
import {Chain} from '@dynamize/termax';

const calls1 = [
  {
    cmd: 'sleep',
    args: ['3']
  },
  {
    cmd: 'sleep',
    args: ['3'],
    spinner: {
      style: 'sunrise'
    }
  },
  {
    cmd: 'sleep',
    args: ['3'],
    spinner: {
      style: 'vivid'
    }
  }
];

const calls2 = [
  {
    cmd: './test.js'
  },
  {
    cmd: './test.js',
    spinner: {
      style: 'cold'
    }
  },
  {
    cmd: './test.js',
    spinner: {
      style: 'sunrise'
    }
  }
];

const chain = new Chain();
chain.addToChain('spawn', calls1);
chain.addToChain('fork', calls2);
chain.executeChain();
```

#### Output from the code above:

![](./gifs/termaxExample4.gif)

#### Setting callbacks on a chain

There are multiple ways to set a callback on a chain.
We can use a setter:

```javascript
import {Chain} from '@dynamize/termax';
// calls1 and calls2 declared here...
const chain = new Chain();
chain.addToChain('spawn', calls1);
chain.addToChain('fork', calls2);
chain.callback = () => {
  console.log('All Done');
};
chain.executeChain();
```

Or we can give it as an argument in addToChain:

```javascript
import {Chain} from '@dynamize/termax';
// calls1 and calls2 declared here...
const chain = new Chain();
chain.addToChain('spawn', calls1);
chain.addToChain('fork', calls2, () => {
  console.log('All Done');
});
chain.executeChain();
```

#### Output from the code above:

![](./gifs/termaxExample5.gif)

What we need to keep in mind is that only one callback can be set on a chain. That will be the last callback given:

```javascript
import {Chain} from '@dynamize/termax';
// calls1 and calls2 declared here...
const chain = new Chain();
chain.addToChain('spawn', calls1, () => {
  console.log('Done #1');
});
chain.addToChain('fork', calls2, () => {
  console.log('Done #2');
});
chain.callback = () => {
  console.log('Done #3');
};
chain.executeChain();
// At the end we only get Done #3 printed out
```

#### Output from the code above:

![](./gifs/termaxExample6.gif)

#### Chain saftey integration

Once executeChain is called a chain, it can't be called again. You need to set up your chain ahead of executing it, any later alterations to it will be ignored:

```javascript
import {Chain} from '@dynamize/termax';
// calls1, calls2 and calls3 declared here...
const chain = new Chain();
chain.addToChain('spawn', calls1);
chain.addToChain('fork', calls2);
chain.executeChain();
chain.addToChain('exec', calls3);
chain.executeChain();
// Only spawn and fork execution sequence are executed
```

## Error Handling

<a name="error_handling"></a>

All termax wrappers come with built-in error handling. By default, it is turned off, and you will simply be prompted that there was an error, but the execution sequence will continue:

```javascript
import {tExec} from '@dynamize/termax';

const calls = [
  {
    cmd: 'sleep 3'
  },
  {
    cmd: 'slep 3',
    sinner: {
      style: 'cold'
    }
  },
  {
    cmd: 'sleep 3',
    spinner: {
      style: 'sunrise'
    }
  }
];

tExec(calls, () => {
  console.log('All done!');
});
```

#### Output from the code above:

![](./gifs/termaxExample7.gif)

But we can change this by adding a handleErrors: true to our config:

```javascript
import {tExec} from '@dynamize/termax';

const calls = [
  {
    cmd: 'sleep 3'
  },
  {
    cmd: 'slep 3',
    handleErrors: true,
    spinner: {
      style: 'cold'
    }
  },
  {
    cmd: 'sleep 3',
    spinner: {
      style: 'sunrise'
    }
  }
];

tExec(calls, () => {
  console.log('All done!');
});
```

#### Output from the code above:

#### Continue

![](./gifs/termaxExample8.gif)

#### Abort

![](./gifs/termaxExample9.gif)

This will stop the execution sequence and prompt the user to choose between: Continue, See Error or Abort, giving users more control.

## Configuration

<a name="configuration"></a>
Configurations that termax wrappers take can be as simple or as complicated as you desire, and can get quite a bit more expensive. Here is how a full config would look:

```javascript
import {tExec} from '@dynamize/termax';

const call = [
  {
    cmd: 'sleep 3',
    args: [],
    handleErrors: true,
    spinner: {
      spinner: 'arrow3',
      style: 'system',
      spawnText: {
        prefix: 'Sleep Starts',
        text: 'Sleeping for 3 sec'
      },
      succeedText: {
        prefix: 'Sleep ended',
        text: 'Woken up'
      },
      errorText: {
        prefix: 'Something disturbed me',
        text: "I guess I'm aweak now"
      },
      color: 'red',
      indent: 4
    }
  }
];

tExec(call);
```

#### Output from the code above:

![](./gifs/termaxExample10.gif)

##### cmd

Type: `string`

In tExec, tExecFile and tSpawn it takes the command to be executed, and in tFork it takes a filename to be executed.

##### args

Type: `string[]`

In tExecFile it takes a name of a file to be executes, in tSpawn it takes arguments passed to the command.

##### handleErrors

Type: `boolean`

Default: `'false'`

If set to true, it implements error handling (default false).

##### spinner

Type: `object`

Takes configuration settings for the spinner.

##### spinner.spinner

Type: `string`

Default: `'dots'`

Values: [provided spinners](https://github.com/sindresorhus/cli-spinners/blob/main/spinners.json)

Sets the type of spinner.

##### spinner.style

Type: `string`

Default: `'default'`

Values: `'default' | 'custom' | 'none' | 'pale' | 'vivid' | 'system' | 'modesty' | 'sunrise' | 'cold'`

Sets one of the prebuilt styles

##### spinner.spawnText

Type: `object`

Sets prefix and text at spawn time.

##### spinner.succeedText

Type: `object`

Sets prefix and text to be shown once the child process ends.

##### spinner.errorText

Type: `object`

Sets prefix and text to be shown in case of an error.

##### spinner.color

Type: `string`

Default: `'green'`

Values: `'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray'`

Sets the color of the spinner.

##### spinner.indent

Type: `number`

Default: `'0'`

Sets the indent of the spinner.

## Styling

<a name="styling"></a>

#### Themes

<a name="themes"></a>
You can use a number of built-in themes to speed up your work simply by adding a style property in the spinner section of the execution config:

```javascript
import {tExec} from '@dynamize/termax';

const call = [
  {
    cmd: 'sleep 3',
    spinner: {
      style: 'vivid'
    }
  }
];

tExec(call);
```

Available themes are:

#### default

![](./gifs/default.gif)

#### none

![](./gifs/none.gif)

#### pale

![](./gifs/pale.gif)

#### vivid

![](./gifs/vivid.gif)

#### system

![](./gifs/system.gif)

#### modesty

![](./gifs/modesty.gif)

#### sunrise

![](./gifs/sunrise.gif)

#### cold

![](./gifs/cold.gif)

#### custom

Custom is the odd one out.

#### Custom Styling

<a name="custom_styling"></a>
If, on the other hand, you would like to have full control of the styling, you could do that by choosing a custom style and passing a style config:

```javascript
import {tExec} from '@dynamize/termax';

const call = {
  cmd: 'sleep 3',
  spinner: {
    style: 'custom',
    styleConfig: {
      errorColor: '#cceb34',
      warrningColor: '#eb3483',
      spawnColor: '#4287f5',
      succeedColor: '#34eb67',
      pausedcolor: '#4287f5',
      messageColor: '#4287f5',
      textColor: '#7134eb'
    }
  }
};

const calls = [];
for (let i = 0; i < 3; i++) {
  calls.push(call);
}

tExec(calls);
```

#### Output from the code above:

![](./gifs/termaxExample11.gif)

Keep in mind that the style config takes hash color codes only.

## Related

- [cli-spinners](https://github.com/sindresorhus/cli-spinners) - Spinners for use in the terminal
- [listr](https://github.com/SamVerschueren/listr) - Terminal task list
- [CLISpinner](https://github.com/kiliankoe/CLISpinner) - Terminal spinner library for Swift
- [spinners](https://github.com/FGRibreau/spinners) - Terminal spinners for Rust
- [marquee-ora](https://github.com/joeycozza/marquee-ora) - Scrolling marquee spinner for Ora
- [briandowns/spinner](https://github.com/briandowns/spinner) - Terminal spinner/progress indicator for Go
- [tj/go-spin](https://github.com/tj/go-spin) - Terminal spinner package for Go
- [observablehq.com/@victordidenko/ora](https://observablehq.com/@victordidenko/ora) - Ora port to Observable notebooks
- [spinnies](https://github.com/jcarpanelli/spinnies) - Terminal multi-spinner library for Node.js
- [kia](https://github.com/HarryPeach/kia) - Simple terminal spinners for Deno

## License

MIT
