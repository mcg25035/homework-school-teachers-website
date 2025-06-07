import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap'; // Removed Jumbotron, added Row, Col

function Component1({ setActiveComponent, isLoggedIn }) {
  return (
    <Container className="text-center mt-5 py-5 bg-light rounded"> {/* Added bg-light and rounded for styling */}
      <Row className="justify-content-center">
        <Col md={8}>
          <h1>歡迎來到我們的學習平台！</h1>
          <p className="lead">
            在這裡，您可以輕鬆管理課程、查看學生、發布文章，並追蹤您的預約。
          </p>
          <hr className="my-4" />
          <p>
            無論您是教師還是學生，我們都致力於提供最佳的學習和管理體驗。
          </p>
          {isLoggedIn ? (
            <p>
              <Button variant="primary" onClick={() => setActiveComponent('CourseList')}>
                查看我的課程
              </Button>
            </p>
          ) : (
            <p>
              <Button variant="primary" onClick={() => setActiveComponent('Login')}>
                立即登入
              </Button>
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Component1;
