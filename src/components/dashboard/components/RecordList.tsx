import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tooltip,
  Modal,
  Form,
  Input,
  notification,
} from 'antd';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { PauseCircleTwoTone, PlayCircleTwoTone, ExclamationCircleFilled } from '@ant-design/icons';
import { set } from 'nprogress';

interface RecordListProps {
  records: Array<{ _id: string; name: string; actions: any }>;
  onPlayRecord: (actions: any) => void;
  onUpdateRecord: (updatedRecord: any) => void;
  onDeleteRecord: (deletedRecordId: string) => void;
}

const RecordList: React.FC<RecordListProps> = ({ records, onPlayRecord, onUpdateRecord, onDeleteRecord }) => {
  const [playingRecordId, setPlayingRecordId] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default page size
  const [form] = Form.useForm();

  const handlePlay = (record: any) => {
    if (playingRecordId === record._id) {
      setPlayingRecordId(null); // Dừng phát
      onPlayRecord(null); // Thông báo dừng phát tới ControlPanel
    } else {
      // console.log(record);
      const actionsWithoutId = record.actions.map(({ _id, ...rest }: any) => rest);
      setPlayingRecordId(record._id); // Đặt bản ghi đang phát
      onPlayRecord(actionsWithoutId); // Gửi hành động tới ControlPanel
    }
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    form.setFieldsValue({ name: record.name });
    setIsEditModalVisible(true);
  };
  const handleDelete = (record: any) => {
    setSelectedRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();

      const isDuplicate = records.some(
        (record) => record.name === values.name
      );

      if (isDuplicate) {
        notification.error({
          message: 'Error',
          description: 'This name already exists. Please choose another name.',
        });
        return;
      }

      const response = await fetch(`http://localhost:5000/api/record/${selectedRecord._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name }),
      });

      if (!response.ok) {
        console.log(response);
        throw new Error('Failed to update record');
      }

      notification.success({
        message: 'Success',
        description: 'Record updated successfully',
      });

      // Update the UI or state after successful update
      onUpdateRecord({ ...selectedRecord, name: values.name });
      setIsEditModalVisible(false);
    } catch (error) {
      notification.error({
              message: 'Error',
              description:
                error instanceof Error ? error.message : 'Failed to edit record',
            });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/record/${selectedRecord._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      notification.success({
        message: 'Success',
        description: 'Record deleted successfully',
      });

      // Update the UI or state after successful deletion
      onDeleteRecord(selectedRecord._id);
      setIsDeleteModalVisible(false);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete record',
      });
    }
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
                <Tooltip title={playingRecordId === record._id ? 'Stop' : 'Play'}>
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
      <Modal
        title="Edit Record"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
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
        title="Delete Record"
        open={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Yes"
        cancelText="No"
        okType='danger'
      > 
        <p>Are you sure you want to delete this record named "{selectedRecord?.name}"?</p>
      </Modal>
    </Card>
  );
};

export default RecordList;
