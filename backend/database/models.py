from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import declarative_base

from datetime import datetime

Base = declarative_base()


class Chat(Base):

    __tablename__ = "chats"

    id = Column(Integer, primary_key=True)

    title = Column(String(255))

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Message(Base):

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)

    chat_id = Column(
        Integer,
        ForeignKey("chats.id")
    )

    role = Column(String(50))

    content = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Document(Base):

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)

    filename = Column(String(255))

    chunk_count = Column(Integer)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )