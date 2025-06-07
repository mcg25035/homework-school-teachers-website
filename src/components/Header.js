import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

function Header({ functionList, setActiveComponent, isLoggedIn, user, logout }) {
  const handleLogout = async () => {
    await logout();
    // SWR in App.js will handle state update and re-render
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand href="#">My App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {functionList.map((item) => (
              <Nav.Link key={item.component} onClick={() => setActiveComponent(item.component)}>
                {item.display}
              </Nav.Link>
            ))}
            {/* Add My Courses link here if user is logged in */}
            {isLoggedIn && (
              <Nav.Link onClick={() => setActiveComponent('MyCourses')}>
                My Courses
              </Nav.Link>
            )}
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
