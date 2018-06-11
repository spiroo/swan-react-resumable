/*
 * @Author: DK
 * @Date: 2018-05-12 11:11:53
 * @Description: 分片上传组件
 * @Last Modified by: DK
 * @Last Modified time: 2018-05-22 17:02:22
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Progress } from 'antd';
import Resumablejs from 'resumablejs';
import { checkBrowerKernel } from './utils';
import './SwanReactResumable.less';

class SwanReactResumable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progressBar: 0,
      fileList: { files: [] },
      isPaused: false,
      isUploading: false,
    };

    this.resumable = null;
  }

  componentDidMount = () => {
    const ResumableField = new Resumablejs({
      target: this.props.service,
      query: this.props.query || {},
      fileType: this.props.filetypes,
      maxFiles: this.props.maxFiles,
      maxFileSize: this.props.maxFileSize,
      fileTypeErrorCallback: (file, errorCount) => {
        if (typeof this.props.onFileAddedError === 'function') {
          this.props.onFileAddedError(file, errorCount);
        }
      },
      maxFileSizeErrorCallback: (file, errorCount) => {
        if (typeof this.props.onMaxFileSizeErrorCallback === 'function') {
          this.props.onMaxFileSizeErrorCallback(file, errorCount);
        }
      },
      testMethod: 'post',
      testChunks: false,
      headers: this.props.headerObject || {},
      withCredentials: this.props.withCredentials || false,
      chunkSize: this.props.chunkSize,
      simultaneousUploads: this.props.simultaneousUploads,
      fileParameterName: this.props.fileParameterName,
      generateUniqueIdentifier: this.props.generateUniqueIdentifier,
      forceChunkSize: this.props.forceChunkSize,
    });

    if (typeof this.props.maxFilesErrorCallback === 'function') {
      ResumableField.opts.maxFilesErrorCallback = this.props.maxFilesErrorCallback;
    }

    ResumableField.assignBrowse(this.uploader);

    // Enable or Disable DragAnd Drop
    if (this.props.disableDragAndDrop === false) {
      ResumableField.assignDrop(this.dropZone);
    }

    ResumableField.on('fileAdded', (file) => {
      this.setState({
        fileList: { files: [file] },
      });
      if (typeof this.props.onFileAdded === 'function') {
        this.props.onFileAdded(file, this.resumable);
      } else {
        ResumableField.upload();
      }
    });

    ResumableField.on('fileSuccess', (file, fileServer) => {
      const mFile = file;
      if (this.props.fileNameServer) {
        const objectServer = JSON.parse(fileServer);
        mFile.fileName = objectServer[this.props.fileNameServer];
      } else {
        mFile.fileName = fileServer;
      }

      this.setState(() => {
        if (typeof this.props.onFileSuccess === 'function') {
          this.props.onFileSuccess(mFile, fileServer);
        }
      });
    });

    ResumableField.on('progress', () => {
      this.setState({
        isUploading: ResumableField.isUploading(),
        progressBar: 0,
      });

      if (ResumableField.progress() * 100 < 100) {
        this.setState({
          progressBar: ResumableField.progress() * 100,
        });
      }
    });

    ResumableField.on('fileError', (file, errorCount) => {
      this.props.onUploadErrorCallback(file, errorCount);
    });

    this.resumable = ResumableField;
  };

  removeFile = (event, file, index) => {
    event.preventDefault();

    const currentFileList = this.state.fileList.files;
    delete currentFileList[index];

    this.setState({
      fileList: { files: currentFileList },
    });

    this.props.onFileRemoved(file);
    this.resumable.removeFile(file);
  };

  createFileList = () => {
    const fileList = this.state.fileList.files;
    const filesLength = fileList.length;
    const file = fileList[filesLength - 1];
    if (file) {
      const uniqID = `${this.props.uploaderID}-${filesLength}`;
      const originFile = file.file;
      return (
        <div className="file" key={uniqID}>
          <span id={`file_${uniqID}`} title={originFile.name}>
            {originFile.name}
          </span>
          <Icon
            onClick={event => this.removeFile(event, file, filesLength - 1)}
            type="close"
            title="删除"
          />
        </div>
      );
    }
  };

  cancelUpload = () => {
    this.resumable.cancel();

    this.setState({
      fileList: { files: [] },
    });

    this.props.onCancelUpload();
  };

  pauseUpload = () => {
    if (!this.state.isPaused) {
      this.resumable.pause();
      this.setState({
        isPaused: true,
      });
      this.props.onPauseUpload();
    } else {
      this.resumable.upload();
      this.setState({
        isPaused: false,
      });
      this.props.onResumeUpload();
    }
  };

  startUpload = () => {
    this.resumable.upload();
    this.setState({
      isPaused: false,
    });
    this.props.onStartUpload();
  };

  clickHandler = () => {
    const system = checkBrowerKernel();
    if (system.ie || system.firefox) {
      this.uploader.click();
    }
  };

  render() {
    let fileList = null;
    if (this.props.showFileList) {
      fileList = <div className="resumableList">{this.createFileList()}</div>;
    }

    let tLabel = null;
    if (this.props.textLabel) {
      tLabel = this.props.textLabel;
    }

    let sButton = null;
    if (this.props.startButton) {
      if (
        typeof this.props.startButton === 'string' ||
        typeof this.props.startButton === 'boolean'
      ) {
        sButton = (
          <button
            disabled={this.state.isUploading}
            className="btn start"
            onClick={this.startUpload}
          >
            {this.props.startButton && 'upload'}
          </button>
        );
      } else sButton = this.props.startButton;
    }

    let cButton = null;
    if (this.props.cancelButton) {
      if (
        typeof this.props.cancelButton === 'string' ||
        typeof this.props.cancelButton === 'boolean'
      ) {
        cButton = (
          <button
            disabled={!this.state.isUploading}
            className="btn cancel"
            onClick={this.cancelUpload}
          >
            {this.props.cancelButton && 'cancel'}
          </button>
        );
      } else cButton = this.props.cancelButton;
    }

    let pButton = null;
    if (this.props.pauseButton) {
      if (
        typeof this.props.pauseButton === 'string' ||
        typeof this.props.pauseButton === 'boolean'
      ) {
        pButton = (
          <button
            disabled={!this.state.isUploading}
            className="btn pause"
            onClick={this.pauseUpload}
          >
            {this.props.pauseButton && 'pause'}
          </button>
        );
      } else pButton = this.props.pauseButton;
    }

    return (
      <div
        className="upload"
        ref={(node) => {
          this.dropZone = node;
        }}
      >
        <Button
          type="primary"
          className="fileUpload"
          disabled={this.props.disableInput || false}
          onClick={this.clickHandler}
        >
          {tLabel}
          <input
            ref={(node) => {
              this.uploader = node;
            }}
            type="file"
            id={this.props.uploaderID}
            name={`${this.props.uploaderID}-upload`}
            accept={this.props.fileAccept || '*'}
            disabled={this.props.disableInput || false}
          />
        </Button>
        {this.state.fileList.files.length > 0 && (
          <div className="progress">
            {fileList}
            <Progress
              style={{ display: this.state.progressBar === 0 ? 'none' : 'block' }}
              percent={parseInt(this.state.progressBar.toFixed(0), 10)}
              strokeWidth={3}
              showInfo={false}
            />
          </div>
        )}

        {sButton}
        {pButton}
        {cButton}
      </div>
    );
  }
}

SwanReactResumable.defaultProps = {
  maxFiles: undefined,
  uploaderID: 'default-resumable-uploader',
  filetypes: [], // 允许上传文件的后缀名，如：['jpg', 'png']
  fileAccept: '*', // 允许上传的文件类型，如：'image/*'
  maxFileSize: 10240000, // 允许上传文件的最大值，单位：bytes
  showFileList: true, // 是否允许显示上传的文件名，默认为：true
  onUploadErrorCallback: (file, errorCount) => {
    console.log('error', file, errorCount);
  },
  onFileRemoved(file) {
    return file;
  },
  onCancelUpload() {
    return true;
  },
  onPauseUpload() {
    return true;
  },
  onResumeUpload() {
    return true;
  },
  onStartUpload() {
    return true;
  },
  disableDragAndDrop: false,
  fileNameServer: '',
  chunkSize: 1024 * 1024, // 上传文件每一块的大小，单位:bytes，默认为：1M
  simultaneousUploads: 1, // 允许同时上传的块数
  fileParameterName: 'file',
  generateUniqueIdentifier: null,
  maxFilesErrorCallback: null, // 上传文件大于允许的文件大小的回调事件
  cancelButton: false, // 是否显示取消按钮，默认为false
  startButton: false, // 是否显示开始按钮，默认为false
  pauseButton: false, // 是否显示暂停按钮，默认为false
  textLabel: '', // 上传按钮的文案，默认为空
  headerObject: {},
  withCredentials: false,
  forceChunkSize: false,
};

SwanReactResumable.propTypes = {
  maxFiles: PropTypes.number,
  uploaderID: PropTypes.string,
  filetypes: PropTypes.array,
  fileAccept: PropTypes.string,
  maxFileSize: PropTypes.number,
  showFileList: PropTypes.bool,
  onUploadErrorCallback: PropTypes.func,
  onFileRemoved: PropTypes.func,
  onCancelUpload: PropTypes.func,
  onPauseUpload: PropTypes.func,
  onResumeUpload: PropTypes.func,
  onStartUpload: PropTypes.func,
  disableDragAndDrop: PropTypes.bool,
  fileNameServer: PropTypes.string,
  chunkSize: PropTypes.number,
  simultaneousUploads: PropTypes.number,
  fileParameterName: PropTypes.string,
  generateUniqueIdentifier: PropTypes.object,
  maxFilesErrorCallback: PropTypes.func,
  cancelButton: PropTypes.bool,
  startButton: PropTypes.bool,
  pauseButton: PropTypes.bool,
  textLabel: PropTypes.string,
  headerObject: PropTypes.object,
  withCredentials: PropTypes.bool,
  forceChunkSize: PropTypes.bool,
};

export default SwanReactResumable;
