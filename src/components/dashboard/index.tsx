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
  Tooltip,
} from 'antd';
import { webRoutes } from '../../routes/web';
import { Link } from 'react-router-dom';
import { User } from '../../interfaces/models/user';
import http from '../../utils/http';
import { apiRoutes } from '../../routes/api';
import { handleErrorResponse } from '../../utils';
import { Review } from '../../interfaces/models/review';
import robotArmImg from '../../assets/img/RobotArm.png';
import { AiFillCaretRight } from 'react-icons/ai';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { InfoCircleOutlined } from '@ant-design/icons';

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
  ],
};

const servoInfo = [
  { servoId: 1, model: 'TD-8120MG', maxValue: 100, minValue: 0 },
  { servoId: 2, model: 'TD-8120MG', maxValue: 100, minValue: 0 },
  { servoId: 3, model: 'MG996R', maxValue: 100, minValue: 0 },
  { servoId: 4, model: 'MG996R', maxValue: 100, minValue: 0 },
  { servoId: 5, model: 'MG996R', maxValue: 100, minValue: 0 },
  { servoId: 6, model: 'MG996R', maxValue: 100, minValue: 0 },
];

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default page size

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
        <Col xl={6} lg={6} md={6} sm={8} xs={8} style={{ marginBottom: 24 }}>
          <Card
            bordered={false}
            className="w-full h-full cursor-default"
            title="Saved Records"
          >
            <Table
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: fakeData.length, // Replace with your API's total record count
                onChange: (page, pageSize) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                },
              }}
              showHeader={true}
              dataSource={fakeData.slice(
                (currentPage - 1) * pageSize,
                currentPage * pageSize
              )}
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
                    <div className="flex gap-5 justify-center">
                      <Tooltip title="Play">
                        <Button onClick={() => showModal(record.actions)}>
                          <AiFillCaretRight />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <Button onClick={() => showModal(record.actions)}>
                          <FaEdit />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button onClick={() => showModal(record.actions)}>
                          <MdDelete />
                        </Button>
                      </Tooltip>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xl={10} lg={10} md={10} sm={8} xs={8} style={{ marginBottom: 24 }}>
          <Card
            bordered={false}
            className="w-full h-full cursor-default"
            title={
              <div className="flex gap-2 justify-center">
                <h2
                  className="text-2xl text-center"
                  style={{ fontWeight: '700px' }}
                >
                  Control Panel
                </h2>
                <Tooltip
                  title={`Hướng dẫn điều khiển: 
Ấn các phím tương ứng với tên servo đển chọn servo (VD: servo 1 thì ấn phím 1);
Các phím lên-xuống (tăng-giảm), trái-phải(giảm-tăng) để điều khiển góc quay của servo. `}
                >
                  <InfoCircleOutlined />{' '}
                </Tooltip>
              </div>
            }
          >
            {[1, 2, 3, 4, 5, 6].map((num, index) => (
              <div key={index}>
                <div className="flex gap-2">
                  <span className="text-lg">Servo {num}</span>
                  <Tooltip title={`Model: ${servoInfo[index].model}`}>
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
                <Slider
                  ref={(el: any) => (sliderRefs.current[index] = el)}
                  min={servoInfo[index].minValue}
                  max={servoInfo[index].maxValue}
                  step={1}
                />
              </div>
            ))}

            <div className="flex justify-center mt-4 gap-5 mt-10">
              <Button type="primary">Record</Button>
              <Button type="primary">Save</Button>
              <Button type="primary">Play</Button>
            </div>
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
