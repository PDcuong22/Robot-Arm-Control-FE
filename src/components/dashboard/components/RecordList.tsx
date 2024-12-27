import React, { useState } from 'react';
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
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { AiFillCaretRight } from 'react-icons/ai';
import { PauseCircleTwoTone, PlayCircleTwoTone } from '@ant-design/icons';

interface RecordListProps {
  records: Array<{ _id: string; name: string; actions: any }>;
  onPlayRecord: (actions: any) => void;
}

const RecordList: React.FC<RecordListProps> = ({ records, onPlayRecord }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [playingRecordId, setPlayingRecordId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default page size

  const handlePlay = (record: any) => {
    if (playingRecordId === record._id) {
      setPlayingRecordId(null); // Dừng phát
      onPlayRecord(null); // Thông báo dừng phát tới ControlPanel
    } else {
      setPlayingRecordId(record._id); // Đặt bản ghi đang phát
      onPlayRecord(record.actions); // Gửi hành động tới ControlPanel
    }
  };

  const handleEdit = (record: any) => {
    console.log('Edit record', record);
  };
  const handleDelete = (record: any) => {
    console.log('Delete record', record);
  };

  return (
    <Card
      bordered={false}
      className="w-full h-full cursor-default"
      title="Saved Records"
    >
      <Table
        scroll={{ x: true }}
        // loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: records.length, // Replace with your API's total record count
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
        }}
        showHeader={true}
        dataSource={records.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize
        ).map((record) => ({
            ...record,
            key: record._id, // Thêm key vào mỗi phần tử
          }))}
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
                  <Button onClick={() => handlePlay(record)}
                    disabled={playingRecordId !== null && playingRecordId !== record._id}>
                    {playingRecordId === record._id ? (
                        <PauseCircleTwoTone />
                    ) : (
                        
                        <PlayCircleTwoTone />
                    )}
                  </Button>
                </Tooltip>
                <Tooltip title="Edit">
                  <Button onClick={() => handleEdit(record)} disabled={playingRecordId !== null}>
                    <FaEdit />
                  </Button>
                </Tooltip>
                <Tooltip title="Delete">
                  <Button onClick={() => handleDelete(record)} disabled={playingRecordId !== null}>
                    <MdDelete />
                  </Button>
                </Tooltip>
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
};

export default RecordList;
