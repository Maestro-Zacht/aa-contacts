# Contributing to AA Contacts

## Translations

The project is looking for translators. Feel free to contribute by going to [Transifex](https://app.transifex.com/alliance-auth/aa-contacts/).

## Development

### License Agreements

#### Project License

This project is licensed under the GNU General Public License v3.0 (GPLv3). See the
[LICENSE](LICENSE) file for details.

By contributing code to this project, you agree that your contributions will be
licensed under the same license as the project itself.

#### CCP

This project is not affiliated with CCP Games in any way. All EVE Online related
content is the property of CCP Games.

Please make sure you have signed the [Developer License Agreement](https://developers.eveonline.com/license-agreement)
by logging in at [EVE: Developers Portal](https://developers.eveonline.com/) before contributing any code.

## Development Setup

In order to set up a development environment, I suggest using the devcontainer setup provided in the repo. The only manual step is to create a `.env` file in the `.devcontainer` folder with the content of the `.env.example` file, then updating the values with your own credentials and configurations.

If you wish to use a more traditional setup, you can use the [AA guide](https://allianceauth.readthedocs.io/en/latest/development/dev_setup/aa-dev-setup-wsl-vsc-v2.html).

## Building the frontend

This project uses a React frontend. At the first time setting up the project, run `make package` to install the dependencies, build and copy the frontend into Django static files. If you wish to contribute to the frontend, you can use `make dev` to start the development server. The changes will be packaged into the Django static files when the package is built in GitHub Actions.

## Generating ESI stubs

The ESI stubs are generated using `make generate-esi-stubs`. It'll use the esi compatibility date specified in the `aa_contacts/__init__.py` file to generate the stubs.

## Running tests

To run the tests locally, you can use `make tox_tests` to run the tests in a tox environment.
