"use client";

// import { BASE_URL, GET_COMMENT } from "@/common/constant";
import { isEmpty } from "lodash";
import { FaRegUser } from "react-icons/fa";
import { Button, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect, useState } from "react";

export default function CommentComponent({
  slug,
  firstDataComment,
}: {
  slug: string;
  firstDataComment: any;
}) {
  const [form] = useForm();
  const [dataComments, setDataComments] = useState<any[]>([]);

  useEffect(() => {
    if (!firstDataComment) return;
    setDataComments(firstDataComment);
  }, [firstDataComment]);

  if (!slug) return null;

  const handleChangeValueComment = (changed: any, value: any) => {
    form.setFieldsValue(value);
  };

  return (
    <section className="comment-container mt-4 border-t border-t-blueSecondary pb-8 pt-4">
      <p className="head-title mb-4 text-xl font-medium">Để lại bình luận</p>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleChangeValueComment}
      >
        <Form.Item
          name="commenter"
          label={<span className="text-white">Nhập tên</span>}
          rules={[
            {
              required: true,
              min: 3,
              message: "Vui lòng nhập tên người bình luận",
            },
          ]}
        >
          <Input placeholder="Nhập tên" />
        </Form.Item>

        <Form.Item
          name="content"
          label={<span className="text-white">Nội dung bình luận</span>}
          rules={[
            {
              required: true,
              min: 3,
              message: "Vui lòng nhập nội dung bình luận",
            },
          ]}
        >
          <Input.TextArea rows={3} placeholder="Nhập bình luận" />
        </Form.Item>

        <Form.Item noStyle>
          <Button type="primary" htmlType="submit" className="">
            Bình luận
          </Button>
        </Form.Item>
      </Form>
      <div className="list-comment mt-8 ">
        {!isEmpty(dataComments) &&
          dataComments?.map((e) => (
            <div className="parent-comment" key={e._id}>
              <article className="username p-2 rounded-xl bg-gray-200 bg-opacity-20 mt-2 flex w-fit items-center gap-1.5 pb-1 text-base font-semibold">
                <p className=" rounded-full bg-[#5142FC] p-2 text-white">
                  <FaRegUser size={14} />
                </p>{" "}
                <div className="">
                  <p className="font-bold text-sm">{e.name}</p>
                  <p className="content my-1 text-sm font-normal">{e.content}</p>
                </div>
              </article>
              {!isEmpty(e.replies) && (
                <div className="child-list-comment-replies ml-2 border-l-2 border-l-blueSecondary pl-3">
                  {e.replies.map((val: any) => (
                    <div className="child-replies-comment" key={val._id}>
                      <p className="replier-name w-fit border-b border-brandLinear pb-1 text-sm font-semibold">
                        User: {val.rep_name}
                      </p>
                      <p className="reply-content text-sm">
                        Content: {val.rep_content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </section>
  );
}

// export default React.memo(CommentComponent)
