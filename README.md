# environment setup

## Install NodeJS.

This app runs on NodeJS, we recommend using [mise](https://mise.jdx.dev) to manage the node version. 

```shellscript
mise use node@lts
```

## Install project dependencies

```shellscript
npm install
```

## Generate the evolver-ng typescript client

1. from the [`/evolver-ng`](https://github.com/ssec-jhu/evolver-ng) repo generate an `openapi.json` file and copy it into this, project's root directory.

```shellscript
tox -e generate_openapi
```

2. from the `/evolver-ui` directory run this command.

```shellscript
npm run bootstrap_evolver_ts_client
```

# Development

## Setup env variables

```shellscript
cp .env.example .env
```

### Setup dev db

```shellscript
npx prisma migrate dev --name init
```

If you adapt the schema run this command again to generate migrations that will be applied to the prod db.

### Run the dev server against the dev db
Run the dev server:

```shellscript
npm run dev
```

## Deployment

This app can run on an evolver device (raspberry pi). It can also run persistently in the cloud or on a local machine in your lab. This app can connect to an unlimited number of evolver devices.

### build the web app

```sh
npm run build
```

### run the web app:

```sh
npm start
```

# dependency documentation

## database - used to store the devices you've connected to
[sqlite](https://www.sqlite.org) - the prisma ORM handles database management (schema, migrations, etc...).

## orm - to manage the db
[Prisma ORM](https://www.prisma.io/docs/orm/prisma-schema/overview)

## framework - a reference implementation demonstrating the capabilities of the evolver's HTTP API.
[Remix](https://remix.run/docs) - a fullstack framework, it consists of a Node.js based server, tightly coupled to a react web app through the use of HTTP web standards and react hooks. 
[React](https://react.dev) - a frontend framework
[Tailwind](https://tailwindcss.com) - a css styling framework
[DaisyUI](https://daisyui.com) - a component library for tailwind, that simplifies composing tailwind classnames by providing generic defaults.

## testing

### unit tests

```sh
npm run test
```

[Vitest](https://vitest.dev) and [react-testing-library](https://testing-library.com/docs/react-testing-library/intro/) are used for unit tests, if a system entity is pure (this term is generally analagous to idempotency) it is a good candidate for unit tests. For example a React component that is a pure function of it's parameters/props. Or remix loaders and actions that are a pure function of the parameters of the incoming request that they handle.

### integration tests

```sh
npm run test:integ
```

Whenever a part of the system relies on network requests or complex user interactions, we consider it impure, in these cases, it has dependencies outside our control. For example network requests fail, or respond with unexpected data, while user interactions introduce cyclomatic complexity. To cover these cases we rely on [MSW](https://mswjs.io/) and [puppeteer](https://pptr.dev/) respectively to encapsulate and manage the complexity introduced by the network boundary and human interaction. Within the context of this app, remix routes are a good candidate for integration tests.

Having trouble with MSW? Refer to this example repo: https://github.com/mswjs/examples/blob/main/examples/with-remix/README.md

### balancing unit and integration tests
https://github.com/remix-run/remix/discussions/5769#discussioncomment-5281163

### e2e tests
in a production system at scale the entire evolver system, would have a simulated and tested as part of its deployment pipeline as close to production as possible. At this stage e2e tests could be run against real hardware. This is out of scope for current stage of research. e2e tests are not included in this software. That said, the front end integration tests could be run without MSW against a real evolver endpoint to achieve this whenever it becomes necessary.