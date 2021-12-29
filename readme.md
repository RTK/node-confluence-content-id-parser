# node-confluence-content-id-parser

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
