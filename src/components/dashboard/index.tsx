import { useEffect, useState, useRef } from 'react';
import BasePageContainer from '../layout/PageContainer';
import {
  BreadcrumbProps,
  Card,
  Col,
  Row,
  Table,
  Slider,
  Button,
  Modal,
} from 'antd';
import { webRoutes } from '../../routes/web';
import { Link } from 'react-router-dom';
import { User } from '../../interfaces/models/user';
import http from '../../utils/http';
import { apiRoutes } from '../../routes/api';
import { handleErrorResponse } from '../../utils';
import { Review } from '../../interfaces/models/review';
import robotArmImg from '../../assets/img/RobotArm.png';

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
  ],
};

const fakeData: any = [
  {
    _id: '6765980b336c6d71395af86f',
    name: 'test2',
    timestamp: '2024-12-20T16:14:49.269Z',
    actions: [
      {
        servoId: 0,
        angle: 45,
        timeDiff: 100,
        _id: '6765980b336c6d71395af870',
      },
      {
        servoId: 1,
        angle: 90,
        timeDiff: 110,
        _id: '6765980b336c6d71395af871',
      },
      {
        servoId: 2,
        angle: 135,
        timeDiff: 150,
        _id: '6765980b336c6d71395af872',
      },
    ],
  },
  {
    _id: '6765980b336c6d71395af89t',
    name: 'test3',
    timestamp: '2024-12-20T16:14:49.269Z',
    actions: [
      {
        servoId: 0,
        angle: 45,
        timeDiff: 100,
        _id: '6765980b336c6d71395af870',
      },
      {
        servoId: 1,
        angle: 90,
        timeDiff: 110,
        _id: '6765980b336c6d71395af871',
      },
      {
        servoId: 2,
        angle: 135,
        timeDiff: 150,
        _id: '6765980b336c6d71395af872',
      },
    ],
  },
];

const Dashboard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);

  const sliderRefs = useRef<(React.RefObject<HTMLInputElement> | null)[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleKeyDown = (event: { key: any }) => {
      const key = event.key;
      if (['1', '2', '3', '4', '5', '6'].includes(key)) {
        const index = parseInt(key, 10) - 1;
        if (sliderRefs.current[index]) {
          sliderRefs.current[index].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    Promise.all([loadUsers(), loadReviews()])
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        handleErrorResponse(error);
      });
  }, []);

  const loadUsers = () => {
    return http
      .get(apiRoutes.users, {
        params: {
          per_page: 4,
        },
      })
      .then((response) => {
        setUsers(response.data.data);
      })
      .catch((error) => {
        handleErrorResponse(error);
      });
  };

  const loadReviews = () => {
    return http
      .get(apiRoutes.reviews, {
        params: {
          per_page: 5,
        },
      })
      .then((response) => {
        setReviews(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          response.data.data.map((rawReview: any) => {
            const review: Review = {
              id: rawReview.id,
              title: rawReview.name,
              color: rawReview.color,
              year: rawReview.year,
              star: Math.floor(Math.random() * 5) + 1,
            };

            return review;
          })
        );
      })
      .catch((error) => {
        handleErrorResponse(error);
      });
  };

  const showModal = (action: any) => {
    setSelectedAction(action);
    setIsModalVisible(true);
  };

  const handleEdit = () => {
    // Implement edit functionality
    console.log('Editing:', selectedAction);
  };

  const handleDelete = () => {
    // Implement delete functionality
    console.log('Deleting:', selectedAction);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedAction(null);
  };

  return (
    <BasePageContainer breadcrumb={breadcrumb} transparent={true}>
      <Row gutter={24}>
        <Col xl={8} lg={8} md={8} sm={8} xs={8} style={{ marginBottom: 24 }}>
          <Card
            bordered={false}
            className="w-full h-full cursor-default"
            title="Saved Records"
          >
            <Table
              loading={loading}
              pagination={false}
              showHeader={true}
              dataSource={fakeData}
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                  align: 'left',
                },
                {
                  title: 'Actions',
                  dataIndex: 'actions',
                  key: 'actions',
                  align: 'center',
                  render: (_, record: any) => (
                    <Button
                      onClick={() => showModal(record.actions)}
                      type="primary"
                    >
                      Play
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xl={8} lg={8} md={8} sm={8} xs={8} style={{ marginBottom: 24 }}>
          <Card
            bordered={false}
            className="w-full h-full cursor-default"
            title="Control Panel"
          >
            {[1, 2, 3, 4, 5, 6].map((num, index) => (
              <div key={index}>
                <div>Servo {num}</div>
                <Slider
                  ref={(el: any) => (sliderRefs.current[index] = el)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col xl={8} lg={8} md={8} sm={8} xs={8} style={{ marginBottom: 24 }}>
          <Card bordered={false} className="w-full h-full cursor-default">
            <img src={robotArmImg} />
          </Card>
        </Col>
      </Row>
      <Modal
        title={
          <div>
            <span className="font-bold text-center">Actions</span>
          </div>
        }
        open={isModalVisible}
        onCancel={closeModal}
        footer={[
          // <Button key="edit" onClick={handleEdit}>
          //   Edit
          // </Button>,
          // <Button key="delete" onClick={handleDelete} danger>
          //   Delete
          // </Button>,
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
      >
        {selectedAction &&
          selectedAction.map((action: any) => (
            <div key={action._id} className="mb-4">
              <p>
                <span className="font-bold">Servo ID:</span> {action.servoId}
              </p>
              <p>
                <span className="font-bold">Angle:</span> {action.angle}
              </p>
              <p>
                <span className="font-bold">Time Difference:</span>{' '}
                {action.timeDiff}ms
              </p>
            </div>
          ))}
      </Modal>
    </BasePageContainer>
  );
};

export default Dashboard;
