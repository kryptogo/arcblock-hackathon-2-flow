import React from 'react';
import { Container, Image, Menu } from 'semantic-ui-react';

import logo from './logo.png';

const MenuComponent = () => (
  <Menu inverted>
    <Container>
      <Menu.Item as="a" header>
        <Image size="mini" src={logo} style={{ marginRight: '1.5em' }} />
        Top 10 Richest Accounts
      </Menu.Item>
    </Container>
  </Menu>
);

export default MenuComponent;
