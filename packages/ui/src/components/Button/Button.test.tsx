import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button',()=>{
 it('defaults to a safe button type',()=>{render(<Button>Save</Button>);expect(screen.getByRole('button',{name:'Save'})).toHaveAttribute('type','button');});
 it('fires click',async()=>{const fn=vi.fn();render(<Button onClick={fn}>Save</Button>);await userEvent.click(screen.getByRole('button'));expect(fn).toHaveBeenCalledOnce();});
 it('is disabled and busy while loading',()=>{render(<Button loading>Save</Button>);const button=screen.getByRole('button',{name:'Loading'});expect(button).toBeDisabled();expect(button).toHaveAttribute('aria-busy','true');});
});
