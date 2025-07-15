#!/usr/bin/env node

import { run } from './cli';
import { Concrete } from './concrete';

export const concreteConfig = new Concrete();

run();
