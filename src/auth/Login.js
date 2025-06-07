import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

function Login({ login }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error);
      return;
    }
    // SWR in App.js will handle state update and re-render
    // Store role in localStorage
    localStorage.setItem('userRole', result.role);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs lg="4">
          <Card>
            <Card.Body>
              <Card.Title className="text-center">Login</Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" type="button" onClick={handleLogin} className="w-100">
                  Login
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
