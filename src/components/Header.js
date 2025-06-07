import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

function Header({ functionList, setActiveComponent, isLoggedIn, user, logout, userRole }) {
  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('userRole'); // Clear role on logout
    // SWR in App.js will handle state update and re-render
  };

  const filteredFunctionList = functionList.filter(item => {
    // If item is hidden, do not show it in the navigation
    if (item.hidden) {
      return false;
    }

    // If not logged in, only show items that do not have roles defined (publicly accessible)
    if (!isLoggedIn) {
      return !item.roles;
    }

    // If logged in, check if the item has roles defined.
    // If no roles are defined for the item, it's accessible to all logged-in users.
    // Otherwise, check if the user's role is included in the item's allowed roles.
    return !item.roles || (item.roles && item.roles.includes(userRole));
  });

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand href="#">南極冰山大系網</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {filteredFunctionList.map((item) => (
              <Nav.Link key={item.component} onClick={() => setActiveComponent(item.component)}>
                {item.display}
              </Nav.Link>
            ))}
          </Nav>
          <Nav>
            {isLoggedIn ? (
              <NavDropdown title={<img
                src="avatar.webp"
                alt="User Avatar"
                className="rounded-circle"
                style={{ width: '1.875em', height: '1.875em' }}
              />} id="basic-nav-dropdown">
                <NavDropdown.Item onClick={() => setActiveComponent('Profile')}>Profile</NavDropdown.Item>
                <NavDropdown.Item onClick={() => setActiveComponent('Settings')}>Settings</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link onClick={() => setActiveComponent('Login')}>Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
