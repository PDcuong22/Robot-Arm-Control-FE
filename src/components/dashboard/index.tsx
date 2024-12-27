import { useEffect, useState, useRef } from 'react';
import BasePageContainer from '../layout/PageContainer';
import { BreadcrumbProps, Card, Col, Row } from 'antd';
import { webRoutes } from '../../routes/web';
import { Link } from 'react-router-dom';
import { User } from '../../interfaces/models/user';
import http from '../../utils/http';
import { apiRoutes } from '../../routes/api';
import { handleErrorResponse } from '../../utils';
import { Review } from '../../interfaces/models/review';
import robotArmImg from '../../assets/img/RobotArm.png';
import RecordList from './components/RecordList';
import ControlPanel from './components/ControlPanel';
const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
  ],
};


const Dashboard = () => {
  const [externalActions, setExternalActions] = useState(null); // Hành động phát từ RecordList
  
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/record');
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };
    fetchRecords();
  }, []);

  const recordNames = records.map(record => record.name);

  const handlePlayRecord = (actions: any) => {
    setExternalActions(actions);
  };

  const handleStopPlaying = () => {
    setExternalActions(null); // Đặt lại trạng thái khi dừng phát
  };

  return (
    <BasePageContainer breadcrumb={breadcrumb} transparent={true}>
      <Row gutter={24}>
        <Col xl={6} lg={6} md={6} sm={8} xs={8} style={{ marginBottom: 24 }}>
          <RecordList records={records} onPlayRecord={handlePlayRecord} />
        </Col>
        <Col xl={10} lg={10} md={10} sm={8} xs={8} style={{ marginBottom: 24 }}>
          <ControlPanel
            // sliders={sliders}
            // setSliders={setSliders}
            externalActions={externalActions}
            onStopPlaying={handleStopPlaying}
            recordNames={recordNames}
          />
        </Col>
        <Col xl={8} lg={8} md={8} sm={8} xs={8} style={{ marginBottom: 24 }}>
          <Card bordered={false} className="w-full h-full cursor-default">
            <img src={robotArmImg} />
          </Card>
        </Col>
      </Row>
    </BasePageContainer>
  );
};

export default Dashboard;
