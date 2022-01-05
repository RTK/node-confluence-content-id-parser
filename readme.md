# node-confluence-content-id-parser

## About

This project provides a Command Line Interface (CLI) for automatic data processing
of Atlassian Confluence instances e.g. for localization purposes.

The `node-confluence-content-id-parser` requests a confluence instance with
credentials and crawls all tables of a destination page. Afterwards all tables
will be broke up into maps of language identifiers and string identifiers. All
maps will be merged in the end and encoded into a JavaScript Object Notation
string which will be persisted into a file named after its corresponding
language identifier.

### Example

Your confluence instance hosts a page e.g. `Translations for our landingpage`
with the page identifier `123456`. The page contains a table, e.g.

| String-Id    | en                      | es                                |
| ------------ | ----------------------- | --------------------------------- |
| headline     | Welcome to our page     | Bienvenido a nuestra página       |
| sub-headline | This is our landingpage | Esta es nuestra página de destino |

When invoking the tool with the arguments

-   --confluence-base-uri=https://ourcompanies.confluence
-   --confluence-page-id=123456
-   --confluence-username=MyUsername
-   --confluence-user-token=MyPassword
-   --recognition-pattern=^String-Id$
-   --output-directory=i18n

There will be two files in the `i18n` directory:

-   en.json
-   es.json

With the following contents:

_en.json_

```
json
{
    "headline": "Welcome to our page",
    "sub-headline": "This is our landingpage"
}
```

_es.json_

```
json
{
    "headline": "Bienvenido a nuestra página",
    "sub-headline": "Esta es nuestra página de destino"
}
```

## Installation

```shell
$ npm install @rtk/node-confluence-content-id-parser
```

### Usage

```shell
$ node-confluence-content-id-parser
  \ --confluence-base-uri=$URI
  \ --confluence-page-id=$ID
  \ --confluence-username=$USERNAME
  \ --confluence-user-token=$TOKEN
  \ --output-directory=$OUTPUT_DIRECTORY
  \ --recognition-pattern=$RECOGNITION_PATTERN
  \ --recognitionFlags=$RECOGNITION_FLAGS
```

#### Arguments

| Argument              | Description                                                                                                                    | Required | Default value          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------- |
| confluence-base-uri   | The base uri of your confluence instance: protocol, hostname and port                                                          | Yes      | -                      |
| confluence-page-id    | The page id of your contents to be analyzed                                                                                    | Yes      | -                      |
| confluence-username   | Your confluence username, uses new Personal Access Token Authentication if none is given                                       | No       | -                      |
| confluence-user-token | Your confluence user token                                                                                                     | Yes      | -                      |
| output-directory      | The directory to which your content-id files will be writte                                                                    | No       | output                 |
| recognition-pattern   | The pattern (regular expression), which will be used to determine which table contains content-ids                             | No       | `^Content-Id$`         |
| recognition-flags     | The regular expression flags to be applied to the `recognition-pattern`                                                        | No       | `i` (case insensitive) |
| identifier-column     | The index of the column containing the key to be used                                                                          | No       | 0                      |
| starting-column       | The column to start indexing language codes from. This can be useful when you have a column containing comments or annotations | No       | 1                      |
| trim-content          | Should all keys and translations values be automatically trimmed (e.g remove whitespaces at beginning and end)                 | No       | true                   |
