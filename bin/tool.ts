#!/usr/bin/env node

import {setupCLIDefaults} from '@ams/cli-toolkit';

import {test} from '../src/main';

setupCLIDefaults();

test();
