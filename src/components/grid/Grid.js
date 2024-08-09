import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Popconfirm, Table, Typography, Button, Modal } from "antd";
import { FetchProducts } from "../../api/Api";
import { MenuOutlined } from "@ant-design/icons";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import "./Grid.css";

const Grid = () => {
  const [products, setProducts] = useState([]);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [columnsOrder, setColumnsOrder] = useState([]);
  const [tempColumnsOrder, setTempColumnsOrder] = useState([]); // Temporary state for columns

  const isEditing = (record) => record.id === editingKey;

  const originalColumns = [
    {
      title: "Name",
      dataIndex: "name",
      editable: true,
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: "Category",
      dataIndex: "category",
      editable: true,
      width: 200,
      filters: [...new Set(products.map((item) => item.category))].map(
        (category) => ({
          text: category,
          value: category,
        })
      ),
      onFilter: (value, record) => record.category.includes(value),
    },
    {
      title: "Price",
      dataIndex: "price",
      editable: true,
      width: 200,
      sorter: (a, b) => a.price - b.price,
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: "Stock",
      dataIndex: "stock",
      editable: true,
      width: 200,
    },
    {
      title: "Operation",
      dataIndex: "operation",
      width: 200,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.id)} style={{ marginInlineEnd: 8 }}>
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <div>
            <Typography.Link disabled={editingKey !== ""} onClick={() => edit(record)} style={{ marginRight: "10px" }}>
              Edit
            </Typography.Link>
            <Typography.Link disabled={editingKey !== ""} onClick={() => deleteRecord(record)}>
              Delete
            </Typography.Link>
          </div>
        );
      },
    },
  ];

  const mergedColumns = columnsOrder.length > 0 ? columnsOrder : originalColumns;

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      // Save logic here
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const deleteRecord = async (record) => {
    // Delete logic here
  };

  const EditableCell = ({ editing, dataIndex, title, inputType, record, children, ...restProps }) => {
    const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required: true, message: `Please Input ${title}!` }]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const handleDrop = (item, index) => {
    const reorderedColumns = Array.from(tempColumnsOrder);
    const [movedColumn] = reorderedColumns.splice(item.index, 1);
    reorderedColumns.splice(index, 0, movedColumn);
    setTempColumnsOrder(reorderedColumns); // Update the temporary state
  };

  const ColumnItem = ({ column, index }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "COLUMN",
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: "COLUMN",
      hover: (item) => {
        if (item.index !== index) {
          handleDrop(item, index);
          item.index = index; // Update the item index
        }
      },
    });

    return (
      <li
        ref={(node) => drag(drop(node))}
        style={{
          opacity: isDragging ? 0.5 : 1,
          userSelect: "none",
          padding: 16,
          marginBottom: 8,
          backgroundColor: "#ffffff",
          border: "1px solid #d9d9d9",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ cursor: "grab" }}>
          <MenuOutlined style={{ marginRight: 8 }} />
          {column.title}
        </span>
      </li>
    );
  };

  const showModal = () => {
    setTempColumnsOrder(mergedColumns); // Set the temporary state with current columns order
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setColumnsOrder(tempColumnsOrder); // Apply the changes to the main state
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const GetProducts = async () => {
      const products = await FetchProducts();
      setProducts(products);
    };
    GetProducts();
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid-container">
        <Button onClick={showModal}>Reorder Columns</Button>
        <Form form={form} component={false}>
          <Table
            components={{ body: { cell: EditableCell } }}
            bordered
            columns={mergedColumns.map((col) => ({
              ...col,
              onCell: (record) => ({
                record,
                inputType: col.dataIndex === "price" || col.dataIndex === "stock" ? "number" : "text",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
              }),
            }))}
            dataSource={products}
            pagination={{ defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: ["5", "10", "15", "20"] }}
            rowKey={"id"}
          />
        </Form>

        <Modal title="Reorder Columns" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {tempColumnsOrder.map((column, index) => (
              <ColumnItem key={column.dataIndex} column={column} index={index} />
            ))}
          </ul>
        </Modal>
      </div>
    </DndProvider>
  );
};

export default Grid;
