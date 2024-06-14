# AllianceAuth Contacts

[![PyPI](https://img.shields.io/pypi/v/aa-contacts)](https://pypi.org/project/aa-contacts/)

This is a plugin for [AllianceAuth](https://gitlab.com/allianceauth/allianceauth) that lets alliances and corporations track and manage their contacts (i.e. standings).

## Overview

### Tracking an Alliance or Corporation

Users with the right [permission](#permissions) can add an alliance or corporation just by clicking on the + button in the index page.

### Viewing Contacts

The index page shows all the alliances and corporations that have been added and are available for that user, that means every alliance or corporation in which the user has a character. Superusers can see all the alliances and corporations.

In every alliance or corporation view, the user can see the contacts and their standings. If it has the right [permissions](#permissions), the user can see and edit notes or trigger a manual update of the contacts.

## Installation

1. Install the package. If you have a traditional installation, run the following command in your terminal:

    ```bash
    pip install aa-contacts
    ```

    If you have a Docker installation instead, add  to your `requirements.txt` file:

    ```pip
    aa-contacts==x.y.z
    ```

    with the desired version and rebuild the Docker stack.

2. Add `'aa_contacts',` to your `INSTALLED_APPS` in `local.py`.

3. Run migrations and collectstatic:

    ```bash
    python manage.py migrate
    python manage.py collectstatic
    ```

    or, if you are on docker:

    ```bash
    auth migrate
    auth collectstatic
    ```

4. Add the update task at the end of the `local.py`:

    ```python
    # AA Contacts
    CELERYBEAT_SCHEDULE['aa_contacts_update_all_contacts'] = {
        'task': 'aa_contacts.tasks.update_all_contacts',
        'schedule': crontab(minute='24'),
    }
    ```

5. Restart Supervisor if you are on a traditional install or the docker stack if you are on docker. 

## Permissions

| Permission                    | Description                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `manage_alliance_contacts`    | Can add tokens for the alliance and trigger manual updates                                                            |
| `manage_corporation_contacts` | Can add tokens for the corporation and trigger manual updates                                                         |
| `view_alliance_notes`         | Can view contact notes for alliance contacts. If combined with `manage_alliance_contacts`, can also edit notes.       |
| `view_corporation_notes`      | Can view contact notes for corporation contacts. If combined with `manage_corporation_contacts`, can also edit notes. |
