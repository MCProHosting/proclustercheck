# ProClustercheck

A MySQL cluster check implementation for Galera clusters, written in NodeJS.

## Usage
Copy the file config/config.default.json to config/config.json. Then run the following commands:
> npm install
>
> npm start

## Configuration

The config file consists of 3 parts: the server config, the MySQL config and the checking behaviour.

### Server config

In this part you can enter the port and the host the server will listen on. You can also specify if you only want to allow specific IP-addresses to be able to connect.

### MySQL config

Here you can specify the MySQL connection details. This is passed through to the 'mysql' module.

For more info about the options that are available, consult the module's documentation [here](https://github.com/felixge/node-mysql#connection-options).

### Behaviour

#### log_directory

This is where the logs will be stored.

#### single_query

This specifies if multiple queries can be run at the same time, in case the first query is delayed somehow.

#### available_when_donor

If the node is currently a donor, should it be shown as available or not.

#### available_when_readonly

If the node is in read only mode, should it be shown as available or not.

#### timeout

The per request timeout. The server will send a unavailable response if the timeout is exceeded.