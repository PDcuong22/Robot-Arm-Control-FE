import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Slider,
  Button,
  Tooltip,
  Modal,
  Form,
  Input,
  notification,
  Spin,
} from 'antd';
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

interface ControlPanelProps {
  externalActions: any;
  onStopPlaying: () => void;
  records: Array<{ _id: string; name: string; actions: any }>;
  onSaveRecord: (newRecord: any) => void;
}

interface Action {
  servoId: number;
  angle: number;
  timeDiff: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  externalActions,
  onStopPlaying,
  records,
  onSaveRecord,
}) => {
  const [sliders, setSliders] = useState([180, 60, 180, 80, 90, 90]);
  const [isPlayingRecordList, setIsPlayingRecordList] = useState(false);
  const [playInterval, setPlayInterval] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prevTime, setPrevTime] = useState<number | null>(null);
  const [recordedActions, setRecordedActions] = useState<Action[]>([]);
  const sliderRefs = useRef<(React.RefObject<HTMLInputElement> | null)[]>([]);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ESPStatus, setESPStatus] = useState(false);
  // Thông tin về các servo
  const servoInfo = [
    { servoId: 0, model: 'TD-8120MG', maxValue: 180, minValue: 90 },
    { servoId: 1, model: 'TD-8120MG', maxValue: 180, minValue: 0 },
    { servoId: 2, model: 'MG996R', maxValue: 180, minValue: 130 },
    { servoId: 3, model: 'MG996R', maxValue: 150, minValue: 0 },
    { servoId: 4, model: 'MG996R', maxValue: 180, minValue: 0 },
    { servoId: 5, model: 'MG996R', maxValue: 120, minValue: 50 },
  ];

  useEffect(() => {
    if (externalActions) {
      setIsPlayingRecordList(true);
      startLoopingActions(externalActions);
    } else {
      stopLoopingActions();
    }
  }, [externalActions]);

  // xử lý sự kiện ấn phím số để chọn servo
  useEffect(() => {
    const handleKeyDown = (event: { key: any }) => {
      if (isModalVisible) return;

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
  }, [isModalVisible]);

  // Kết nối với server
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('ESP-status', (data: any) => {
      // console.log('ESP status:', data);
      const { status, currentServos } = data;
      setESPStatus(status);
      if (status) {
        setSliders(currentServos);
      }
    });
  }, []);

  // Xử lý khi thay đổi giá trị thanh trượt
  const handleSliderChange = (id: number, value: number) => {
    if (isPlaying || isPlayingRecordList) return; // Ngăn không cho phép thay đổi khi đang phát
    const newSliders = [...sliders];
    newSliders[id] = value;
    setSliders(newSliders);

    const currentTime = Date.now(); // Lấy thời gian hiện tại
    const timeDiff = prevTime !== null ? currentTime - prevTime : 0; // Tính thời gian chênh lệch
    setPrevTime(currentTime); // Cập nhật thời gian trước đó
    let data = {
      servoId: id,
      angle: value,
      timeDiff: timeDiff,
    };
    socket.emit('servo-control', data);

    // Nếu đang ghi thì lưu lại hành động
    if (isRecording) {
      setRecordedActions((prevActions) => [...prevActions, data]);
    }
  };

  // Xử lý sự kiên ấn nút Record
  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false); // Kết thúc ghi
    } else {
      setPrevTime(null); // Reset thời gian trước đó
      setRecordedActions([]); // Bắt đầu ghi mới
      prevSlidersRef.current = [];
      //Lấy các vị trí của servo lúc bắt đầu
      sliders.forEach((value, index) => {
        const data = {
          servoId: index,
          angle: value,
          timeDiff: 0,
        };
        setRecordedActions((prevActions) => [...prevActions, data]);
      });
      setIsRecording(true);
    }
  };

  // xử lý sự kiên ấn nút Play
  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false); // Dừng phát
      stopLoopingActions();
    } else {
      if (recordedActions.length > 6) {
        setIsPlaying(true);
        startLoopingActions(recordedActions);
      } else {
        alert('Không có hành động nào để phát lại!');
      }
    }
  };

  // Xử lý sự kiện lưu bản ghi
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const isDuplicate = records.some((record) => record.name === values.name);

      if (isDuplicate) {
        notification.error({
          message: 'Error',
          description: 'This name already exists. Please choose another name.',
        });
        return;
      }

      const response = await fetch('http://localhost:5000/api/record/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name, actions: recordedActions }),
      });

      if (!response.ok) {
        throw new Error('Failed to save record');
      }

      const { newRecord } = await response.json();

      if (!newRecord || !newRecord._id) {
        throw new Error('Invalid record data');
      }

      notification.success({
        message: 'Success',
        description: 'Record saved successfully!',
      });
      onSaveRecord(newRecord);
      setRecordedActions([]);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      notification.error({
        message: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save record',
      });
    }
  };

  const currentIndexRef = useRef(0);
  const prevSlidersRef = useRef<number[]>([]);

  // Xử lý phát lại các hành động đã ghi

  const startLoopingActions = (actions: Action[]) => {
    currentIndexRef.current = 0;

    // Bước đầu tiên là đưa các servo từ vị trí hiện tại về vị trí bắt đầu của mỗi servo
    const interval = setInterval(() => {
      if (ESPStatus) {
        if (currentIndexRef.current < 6) {
          setSliders((prev) => {
            const newSlider = [...prev];
            const action = actions[currentIndexRef.current];
            if (newSlider[currentIndexRef.current] === action.angle) {
              currentIndexRef.current =
                (currentIndexRef.current + 1) % actions.length;
            } else {
              const action = actions[currentIndexRef.current];
              newSlider[currentIndexRef.current] =
                action.angle > newSlider[currentIndexRef.current]
                  ? newSlider[currentIndexRef.current] + 1
                  : newSlider[currentIndexRef.current] - 1;
              socket.emit('servo-control', {
                ...action,
                angle: newSlider[action.servoId],
              });
            }
            prevSlidersRef.current = [
              newSlider[0],
              newSlider[1],
              newSlider[2],
              newSlider[3],
              newSlider[4],
              newSlider[5],
            ];
            return [...prevSlidersRef.current];
          });
        } else {
          // Phát lại các hành động đã ghi
          const action = actions[currentIndexRef.current];
          prevSlidersRef.current[action.servoId] = action.angle;
          socket.emit('servo-control', action);
          setSliders([...prevSlidersRef.current]);
          currentIndexRef.current =
            (currentIndexRef.current + 1) % actions.length;
        }
      }
    }, 50);

    setPlayInterval(interval);
  };

  // Dừng phát lại các hành động
  const stopLoopingActions = () => {
    if (playInterval) {
      clearInterval(playInterval);
      setPlayInterval(null);
    }
    setIsPlayingRecordList(false);
    onStopPlaying();
  };

  return (
    <Card
      bordered={false}
      className="w-full h-full cursor-default"
      title={
        <div className="flex gap-2 justify-center">
          <h2 className="text-2xl text-center" style={{ fontWeight: '700px' }}>
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
      {sliders.map((value, index) => (
        <div key={index}>
          <div className="flex gap-2">
            <span className="text-lg">Servo {index + 1}</span>
            <Tooltip title={`Model: ${servoInfo[index]?.model}`}>
              <InfoCircleOutlined />
            </Tooltip>
          </div>
          <Slider
            ref={(el: any) => (sliderRefs.current[index] = el)}
            min={servoInfo[index]?.minValue}
            max={servoInfo[index]?.maxValue}
            step={1}
            value={value}
            onChange={(value) => handleSliderChange(index, value)}
          />
        </div>
      ))}

      {!isPlayingRecordList && (
        <div className="flex justify-center mt-4 gap-5 mt-10">
          {!isRecording && !isPlaying && (
            <Button type="primary" onClick={handleRecord}>
              {recordedActions.length > 0 ? 'Start Recording Again' : 'Record'}
            </Button>
          )}
          {/* Nút Stop Recording */}
          {isRecording && (
            <Button type="primary" onClick={handleRecord}>
              Stop Recording
            </Button>
          )}
          {!isRecording && recordedActions.length > 6 && (
            <Button onClick={handlePlay} type="primary">
              {isPlaying ? 'Stop Playing' : 'Play'}
            </Button>
          )}

          {/* Nút Save */}
          {!isRecording && !isPlaying && recordedActions.length > 6 && (
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
              Save
            </Button>
          )}
        </div>
      )}
      <Modal
        title="Save Record"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form}>
          <Form.Item
            name="name"
            label="Record Name"
            rules={[
              { required: true, message: 'Please input the record name!' },
              { min: 3, message: 'Name must be at least 3 characters!' },
            ]}
          >
            <Input placeholder="Enter record name" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="ESP disconnected!!"
        open={!ESPStatus}
        footer={null}
        closable={false}
        style={{ textAlign: 'center' }}
      >
        <Spin indicator={<LoadingOutlined spin />} />
      </Modal>
    </Card>
  );
};

export default ControlPanel;
