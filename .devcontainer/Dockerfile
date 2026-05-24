ARG AA_DOCKER_TAG
FROM $AA_DOCKER_TAG

ENV UV_PYTHON_DOWNLOADS=0
ENV UV_SYSTEM_PYTHON=1
ENV UV_LINK_MODE=copy
ENV UV_TOOL_BIN_DIR=/usr/local/bin
ENV UV_PROJECT_ENVIRONMENT="/usr/local/"

USER root
RUN apt-get update && apt-get install make gnupg2 gettext curl wget -y
COPY --from=ghcr.io/astral-sh/uv:0.11 /uv /uvx /bin/
USER ${AUTH_USER}

# set env
ENV NVM_DIR=${AUTH_HOME}/.nvm
ENV NODE_VERSION=22

# Install Node.js
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
RUN bash -c "source ${NVM_DIR}/nvm.sh && nvm install ${NODE_VERSION} && nvm alias default ${NODE_VERSION} && nvm use default && nvm version | xargs -I {} ln -s $NVM_DIR/versions/node/{} $NVM_DIR/versions/node/v$NODE_VERSION"
ENV PATH=${NVM_DIR}/versions/node/v${NODE_VERSION}/bin:$PATH

USER root
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=.devcontainer/requirements.txt,target=requirements.txt \
    uv pip install --system -r requirements.txt
COPY . /workspace
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system -e /workspace
USER ${AUTH_USER}