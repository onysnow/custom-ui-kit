import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconButton } from './IconButton';
describe('IconButton',()=>{it('requires and exposes an accessible name',()=>{render(<IconButton aria-label="Add item" icon={<span>+</span>}/>);expect(screen.getByRole('button',{name:'Add item'})).toHaveAttribute('type','button');});});
