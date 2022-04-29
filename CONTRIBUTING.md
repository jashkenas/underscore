## How to contribute to Underscore.js

* This project adheres to a [code of conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

* Please do not open a ticket to report a security issue. Consult the [security policy](SECURITY.md) on what to do instead.

* Before you open a ticket or send a pull request, [search](https://github.com/jashkenas/underscore/issues) for previous discussions about the same feature or issue. Add to the earlier ticket if you find one.

* If you're proposing a new feature, make sure it isn't already implemented in [Underscore-Contrib](https://github.com/documentcloud/underscore-contrib).

* When contributing code, make sure that you edit the source code in the `modules/` directory. Also, run `npm install` before committing any changes to ensure that our commit hooks can do their work.

* Before sending a pull request for a feature, be sure to have [tests](https://underscorejs.org/test/).

* Use the same coding style as the rest of the [codebase](https://github.com/jashkenas/underscore/blob/master/modules/index.js).

* In your pull request, do not add documentation or re-build the minified `underscore-umd-min.js` file. We'll do those things before cutting a new release.

### "Help, cloning fails with `fatal: fsck error in packed object`"
This error is caused by zero-padded file modes in the commit history. As fixing this is highly destructive, we suggest ignoring these warnings. The simplest way is to instruct git to do so when cloning. For example, to clone from `jashkenas/underscore`, run the following command: `git clone --config transfer.fsckobjects=false git@github.com:jashkenas/underscore.git`. If cloning from a different user or organization, replace `jashkenas` with their name in the previous command.