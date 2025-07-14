#!/usr/bin/env node

import { run } from './cli';
import { ConcreteConfig } from './concrete';

export const concreteConfig = new ConcreteConfig();

run();
