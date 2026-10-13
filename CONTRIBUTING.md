## How to contribute to Underscore.js

* This project adheres to a [code of conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

* Please do not open an issue to report a security issue. Consult the [security policy](SECURITY.md) on what to do instead.

* Before you open an issue or send a pull request, [search](https://github.com/jashkenas/underscore/issues) for previous discussions about the same feature or issue. Add to the earlier ticket if you find one.

* If you're proposing a new feature, make sure it isn't already implemented in [Underscore-Contrib](https://github.com/documentcloud/underscore-contrib).

* When contributing code, make sure that you edit the source code in the `modules/` directory. Also, run `npm install` before committing any changes to ensure that our commit hooks can do their work.

* Before sending a pull request for a feature, be sure to have [tests](https://underscorejs.org/test/).

* Use the same coding style as the rest of the [codebase](https://github.com/jashkenas/underscore/blob/master/modules/index.js).

* In your pull request, do not re-generate the annotated source or the minified `underscore-umd-min.js` file. We'll do those things before cutting a new release.

### "Help, cloning fails with `fatal: fsck error in packed object`"
This error is caused by zero-padded file modes in the commit history. As fixing this is highly destructive, we suggest ignoring these warnings. The simplest way is to instruct git to do so when cloning. For example, to clone from `jashkenas/underscore`, run the following command: `git clone --config transfer.fsckobjects=false git@github.com:jashkenas/underscore.git`. If cloning from a different user or organization, replace `jashkenas` with their name in the previous command.

### Containerized development

As of version 1.13.9, contributors have the option to run `npm` and other node commands inside a container. This will isolate anything that happens inside `node_modules` from the rest of your system, which gives you some protection against supply chain attacks like [Shai-Hulud][shaihulud]. If you want to switch to this workflow, the following steps will get you prepared.

1. Set the environment variable `UNDERSCORE_DEV_OCI` to `podman` or `docker`, depending on which you want to use. To persist this setting so it keeps this value in every terminal even after you reboot, search the internet for `~/.profile` if you use a unixy system or `HKEY_CURRENT_USER\Environment` if you use Windows.

2. Run `podman compose up -d` or `docker compose up -d`. This creates and launches two containers, `node` and `nginx`. The `node` container ensures you have all `node_modules` installed in a persistent [volume][docker-volume], then exits. The `nginx` container runs a local webserver so you can preview the documentation at http://localhost:8088 . To stop it, run `podman compose down` or `docker compose down`.

3. Run `npm run containerize`. This configures our commit hooks to run inside the container.

After these steps, you will notice that your `node_modules` folder is empty. This is because they are now stored in a container volume instead.

From now on, any time you run `npm` or another node command while working on Underscore, prefix the command with `./cono` to run it inside the `node` container. For example, `npm run test` becomes `./cono npm run test`. The name "cono" is a shorthand for "containerized node".

If you accidentally forget to prefix `./cono` when running `npm install`, `npm prepare` or `npm publish`, this will reset the commit hooks to run on your host machine. To fix this, run `npm run containerize` again, WITHOUT `./cono` (this is the only exception).

Other than that, your workflow does not need to change. In particular, it is not necessary to run `{podman,docker} compose up -d` every time you work on Underscore; this is just a convenient way to make sure you have the latest dependencies installed and also start the local webserver.

[shaihulud]: https://www.upguard.com/blog/the-shai-hulud-attack-explained
[docker-volume]: https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/
