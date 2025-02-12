'use client';
import { ReactNode } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link
} from '@heroui/react';

export const Navigation = (): ReactNode => {
  return (
    <Navbar className="mb-20">
      <NavbarContent justify="start">
        <NavbarBrand>
          <p className="text-lg italic font-medium">Adoptogram</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center">
        <NavbarItem>
          <Link href="/home">Home</Link>
        </NavbarItem>

        <NavbarItem>
          <Link href="/search">Search</Link>
        </NavbarItem>

        <NavbarItem>
          <Link href="/favorites">Favorites</Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Link href="/logout">Logout</Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};
