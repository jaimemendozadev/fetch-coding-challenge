'use client';
import { ReactNode } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link
} from '@heroui/react';

const Navigation = (): ReactNode => {
  return (
    <Navbar>
      <NavbarBrand>
        <p>Adoptogram</p>
      </NavbarBrand>

      <NavbarContent justify="center">
        <NavbarItem>
          <Link href="/home">Home</Link>
        </NavbarItem>

        <NavbarItem>
          <Link href="/favorites">Favorites</Link>
        </NavbarItem>

        <NavbarItem>
          <Link href="/search">Integrations</Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Link href="#">Logout</Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};
