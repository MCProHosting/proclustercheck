# ProClusterCheck

A MySQL cluster check implementation for Galera clusters written in NodeJS that acts as a drop-in replacement for Percona's clustercheck script.

The Problem: the clustercheck shell script provided by Percona is daemonized and runs through a service called Xinet; when the xeintd daemon receives a request it forks a process for whatever shell script is requested and returns the result of that script to the requester. The problem with this is that if MySQL or any part of this system happens to get bogged down during this process and the script hangs for longer than your check interval, forked processes, file descriptors, and network sockets quickly to pile up which can eventually lead to a complete system crash. 

We attack this probelm by rewritign the clustercheck script and Xinetd's functionality in the fully asynchronous NodeJS. This allows us to leverage V8's event loop in order to prevent pile up of forked processes. This is particularly useful in the event you intend to preform heath checks at a rapid interval (10ms between checks is reasonable with this daemon) as it will never allow for piled up requests. In addition to this, we also have the configurable ability to return 503 responses if a request is already being processed. This makes dealing with increased latency even easier, however, if MySQL hangs for a brief moment it can result in a potential avoidable failed health check, so we've left this configurable. 

Since ProClusterCheck is built as a drop-in replacement for clustercheck, it takes and responds to HTTP requests with status codes relative to the current status of WSREP replication. It also features all the configurability of clustercheck (not synced on donor/read-only, etc...) and more.

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
