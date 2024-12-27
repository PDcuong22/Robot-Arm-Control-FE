import React, { useState, useEffect, useRef } from 'react';
import { Card, Slider, Button, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import { set } from 'nprogress';

const servoInfo = [
  { servoId: 1, model: 'TD-8120MG', maxValue: 180, minValue: 90 },
  { servoId: 2, model: 'TD-8120MG', maxValue: 180, minValue: 0 },
  { servoId: 3, model: 'MG996R', maxValue: 180, minValue: 90 },
  { servoId: 4, model: 'MG996R', maxValue: 150, minValue: 0 },
  { servoId: 5, model: 'MG996R', maxValue: 180, minValue: 0 },
  { servoId: 6, model: 'MG996R', maxValue: 120, minValue: 50 },
];

interface ControlPanelProps {
  // sliders: number[];
  // setSliders: (sliders: number[]) => void;
  externalActions: any;
  onStopPlaying: () => void;
  recordNames: string[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  // sliders,
  // setSliders,
  externalActions,
  onStopPlaying,
  recordNames,
}) => {
  const [sliders, setSliders] = useState([180, 90, 90, 90, 90, 90]); // Trạng thái ban đầu
  const [isPlayingRecordList, setIsPlayingRecordList] = useState(false);
  const [playInterval, setPlayInterval] = useState<number | null>(null); // Lưu trữ interval để dừng
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // Trạng thái đang phát lại
  const [prevTime, setPrevTime] = useState<number | null>(null); // Thời gian thay đổi trước đó
  const [recordedActions, setRecordedActions] = useState<
    { servoId: number; angle: number; timeDiff: number }[]
  >([]);
  const sliderRefs = useRef<(React.RefObject<HTMLInputElement> | null)[]>([]);
  useEffect(() => {
    if (externalActions) {
      setIsPlayingRecordList(true);
      startLoopingActions(externalActions);
    } else {
      stopLoopingActions();
    }
  }, [externalActions]);

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

  const handleSliderChange = (id: number, value: number) => {
    if (isPlaying || isPlayingRecordList) return; // Ngăn không cho phép thay đổi khi đang phát
    const newSliders = [...sliders];
    newSliders[id] = value;
    setSliders(newSliders);
    // console.log(sliders);

    const currentTime = Date.now(); // Lấy thời gian hiện tại
    const timeDiff = prevTime !== null ? currentTime - prevTime : 0; // Tính thời gian chênh lệch
    setPrevTime(currentTime); // Cập nhật thời gian trước đó
    let data = {
      servoId: id,
      angle: value,
      timeDiff: timeDiff,
    };
    //   socket.emit("servo-control", data);

    if (isRecording) {
      setRecordedActions((prevActions) => [...prevActions, data]);
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false); // Kết thúc ghi
    } else {
      setPrevTime(null); // Reset thời gian trước đó
      setRecordedActions([]); // Bắt đầu ghi mới
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

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false); // Dừng phát lại
      stopLoopingActions();
    } else {
      if (recordedActions.length > 6) {
        // console.log('Playing actions:', recordedActions);
        // Thêm logic phát lại tại đây
        setIsPlaying(true);
        startLoopingActions(recordedActions);
      } else {
        alert('Không có hành động nào để phát lại!');
      }
    }
  };

  const saveRecord = async (record: any) => {
    const response = await fetch('http://localhost:5000/api/record/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      throw new Error('Failed to save record');
    }
  };

  const handleSave = async () => {
    const name = prompt('Nhập tên cho bản ghi:');
    if (!name) {
      alert('Vui lòng nhập tên cho bản ghi.');
      return;
    }
    if (recordNames.includes(name)) {
      alert('Tên này đã tồn tại, vui lòng chọn tên khác.');
      return;
    }
    try {
      await saveRecord({ name, actions: recordedActions });
      toast.success('Successfully saved record!');

      // Xóa bản ghi và ẩn nút Save
      setRecordedActions([]);
    } catch (error) {
      if (error instanceof Error) {
        alert('Lỗi khi lưu bản ghi: ' + error.message);
      } else {
        alert('Lỗi khi lưu bản ghi');
      }
    }
  };

  const startLoopingActions = (actions: any) => {
    // console.log('Start looping actions:', actions);
    let currentIndex = 0;
    const interval = setInterval(() => {
      console.log('currentIndex', currentIndex);
      const action = actions[currentIndex];
      // const newSliders = [...sliders];
      if (currentIndex < 6) {
        setSliders((prev) => {
          const newSliders = [...prev];
          if (newSliders[action.servoId] === action.angle) {
            currentIndex = currentIndex + 1;
          } else {
            
            newSliders[action.servoId] =
              action.angle > newSliders[action.servoId]
                ? newSliders[action.servoId] + 1
                : newSliders[action.servoId] - 1;
          }
          console.log('sliders', newSliders);
          return newSliders;
        });

      } else {
        // const action = actions[currentIndex];
        const newSliders = [...sliders];
        newSliders[action.servoId] = action.angle;
        console.log('sliders', newSliders);
        setSliders(newSliders);
        currentIndex = (currentIndex + 1) % recordedActions.length;
      }
      // console.log('sliders', sliders);
      // const action = actions[currentIndex];
      // const newSliders = [...sliders];
      // newSliders[action.servoId] = action.angle;
      // setSliders(newSliders);

      // currentIndex = (currentIndex + 1) % recordedActions.length;
    }, 500);
    setPlayInterval(interval);
  };

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
            <Tooltip title={`Model: ${servoInfo[index].model}`}>
              <InfoCircleOutlined />
            </Tooltip>
          </div>
          <Slider
            ref={(el: any) => (sliderRefs.current[index] = el)}
            min={servoInfo[index].minValue}
            max={servoInfo[index].maxValue}
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
          {!isRecording && recordedActions.length > 0 && (
            <Button onClick={handlePlay} type="primary">
              {isPlaying ? 'Stop Playing' : 'Play'}
            </Button>
          )}

          {/* Nút Save */}
          {!isRecording && !isPlaying && recordedActions.length > 0 && (
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default ControlPanel;
