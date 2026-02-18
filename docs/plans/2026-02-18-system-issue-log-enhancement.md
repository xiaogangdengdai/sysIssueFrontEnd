# 系统问题日志功能增强实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 增强系统问题日志功能，添加审计字段、附件类型区分和详情查看功能

**Architecture:** 后端Spring Boot 3 + MyBatis Plus，前端Vue 3 + Element Plus。采用分层架构，新增字段通过实体类扩展，附件类型通过API参数过滤实现，详情页面复用编辑表单但设置为只读模式。

**Tech Stack:** Spring Boot 3.2, MyBatis Plus 3.5, Vue 3, TypeScript, Element Plus 2.13, Axios

---

## Task 1: 后端 - 扩展SystemIssueLog实体添加审计字段

**Files:**
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/backend/src/main/java/com/qino/log/entity/SystemIssueLog.java`
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/backend/src/main/java/com/qino/log/req/SystemIssueLogCreateReq.java`
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/backend/src/main/java/com/qino/log/req/SystemIssueLogUpdateReq.java`
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/backend/src/main/java/com/qino/log/vo/SystemIssueLogVO.java`

**Step 1: 修改SystemIssueLog实体类，添加审计字段**

```java
package com.qino.log.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 系统问题日志实体类
 *
 * @author wangzhihao
 */
@Data
@TableName("system_issue_log")
public class SystemIssueLog {

    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    /**
     * 类型：1.bug修复 2.新功能开发 3.原有功能改造 4.页面原型快速实现
     */
    private Integer type;

    /**
     * 问题描述（保留字段，不在前端展示）
     */
    private String description;

    /**
     * SQL建表语句
     */
    private String createTableSql;

    /**
     * 新需求描述
     */
    private String newRequirement;

    /**
     * 改造前功能描述
     */
    private String beforeTransformation;

    /**
     * 改造后的目标
     */
    private String transformation;

    /**
     * 业务介绍
     */
    private String businessContext;

    /**
     * 备注
     */
    private String remark;

    /**
     * 状态：1:待处理, 2:处理中, 3:已完成, 4:处理失败
     */
    private Integer status;

    /**
     * 创建人
     */
    private String creator;

    /**
     * 创建人IP地址
     */
    private String creatorIp;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 修改人
     */
    private String modifyUser;

    /**
     * 修改人IP地址
     */
    private String modifyIp;

    /**
     * 修改时间
     */
    private LocalDateTime modifyAt;
}
```

**Step 2: 修改SystemIssueLogCreateReq请求类**

```java
package com.qino.log.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 创建请求
 */
@Data
public class SystemIssueLogCreateReq {

    @NotNull(message = "类型不能为空")
    private Integer type;

    private String createTableSql;

    private String newRequirement;

    private String beforeTransformation;

    private String transformation;

    @NotBlank(message = "业务介绍不能为空")
    private String businessContext;

    private String remark;

    private String creator;

    /**
     * 创建人IP地址（由前端传入或后端获取）
     */
    private String creatorIp;
}
```

**Step 3: 修改SystemIssueLogUpdateReq请求类**

```java
package com.qino.log.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新请求
 */
@Data
public class SystemIssueLogUpdateReq {

    @NotBlank(message = "ID不能为空")
    private String id;

    @NotNull(message = "类型不能为空")
    private Integer type;

    private String createTableSql;

    private String newRequirement;

    private String beforeTransformation;

    private String transformation;

    @NotBlank(message = "业务介绍不能为空")
    private String businessContext;

    @NotNull(message = "状态不能为空")
    private Integer status;

    private String remark;

    /**
     * 修改人
     */
    private String modifyUser;

    /**
     * 修改人IP地址
     */
    private String modifyIp;
}
```

**Step 4: 修改SystemIssueLogVO视图类**

```java
package com.qino.log.vo;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 视图对象
 */
@Data
public class SystemIssueLogVO {

    private String id;
    private Integer type;
    private String createTableSql;
    private String newRequirement;
    private String beforeTransformation;
    private String transformation;
    private String businessContext;
    private String remark;
    private Integer status;
    private String creator;
    private String creatorIp;
    private LocalDateTime createdAt;
    private String modifyUser;
    private String modifyIp;
    private LocalDateTime modifyAt;
}
```

**Step 5: 提交后端实体修改**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/backend
git add src/main/java/com/qino/log/entity/SystemIssueLog.java
git add src/main/java/com/qino/log/req/SystemIssueLogCreateReq.java
git add src/main/java/com/qino/log/req/SystemIssueLogUpdateReq.java
git add src/main/java/com/qino/log/vo/SystemIssueLogVO.java
git commit -m "feat: add audit fields to SystemIssueLog entity (creatorIp, modifyUser, modifyIp, modifyAt)"
```

---

## Task 2: 后端 - 扩展SysAttachment实体添加type字段

**Files:**
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/backend/src/main/java/com/qino/log/entity/SysAttachment.java`

**Step 1: 修改SysAttachment实体类，添加type字段**

```java
package com.qino.log.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 通用附件实体类
 */
@Data
@TableName("sys_attachment")
public class SysAttachment {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 类型（1.用户上传 2.系统生成）
     */
    private Integer type;

    /**
     * 关联目标类型（system_issue_log/sys_log）
     */
    private String targetType;

    /**
     * 关联目标ID
     */
    private String targetId;

    /**
     * 原始文件名
     */
    private String fileName;

    /**
     * 文件存储路径
     */
    private String filePath;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件类型（MIME类型）
     */
    private String fileType;

    /**
     * 文件扩展名
     */
    private String fileExt;

    /**
     * 文件MD5值
     */
    private String md5;

    /**
     * 排序号
     */
    private Integer sortOrder;

    /**
     * 备注
     */
    private String remark;

    /**
     * 上传人
     */
    private String creator;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 删除标记（0未删除 1已删除）
     */
    @TableLogic
    private Integer deleted;
}
```

**Step 2: 提交附件实体修改**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/backend
git add src/main/java/com/qino/log/entity/SysAttachment.java
git commit -m "feat: add type, md5, remark, updateTime fields to SysAttachment entity"
```

---

## Task 3: 后端 - 修改SysAttachmentService支持type过滤

**Files:**
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/backend/src/main/java/com/qino/log/service/SysAttachmentService.java`
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/backend/src/main/java/com/qino/log/service/impl/SysAttachmentServiceImpl.java`

**Step 1: 修改SysAttachmentService接口**

```java
package com.qino.log.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.qino.log.entity.SysAttachment;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 附件服务接口
 */
public interface SysAttachmentService extends IService<SysAttachment> {

    /**
     * 上传附件
     * @param targetType 目标类型
     * @param targetId 目标ID
     * @param file 文件
     * @param type 附件类型（1.用户上传 2.系统生成）
     * @return 附件实体
     */
    SysAttachment upload(String targetType, String targetId, MultipartFile file, Integer type);

    /**
     * 按类型查询附件列表
     * @param targetType 目标类型
     * @param targetId 目标ID
     * @param type 附件类型（可选，null表示查询全部）
     * @return 附件列表
     */
    List<SysAttachment> listByTarget(String targetType, String targetId, Integer type);

    /**
     * 删除附件（包含物理文件）
     * @param id 附件ID
     */
    void deleteWithFile(Long id);

    /**
     * 按目标删除所有附件
     * @param targetType 目标类型
     * @param targetId 目标ID
     */
    void deleteByTarget(String targetType, String targetId);

    /**
     * 获取文件内容
     * @param id 附件ID
     * @return 文件内容
     */
    String getFileContent(Long id);
}
```

**Step 2: 修改SysAttachmentServiceImpl实现类**

```java
package com.qino.log.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.qino.log.entity.SysAttachment;
import com.qino.log.mapper.SysAttachmentMapper;
import com.qino.log.service.SysAttachmentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 附件服务实现类
 */
@Service
public class SysAttachmentServiceImpl extends ServiceImpl<SysAttachmentMapper, SysAttachment> implements SysAttachmentService {

    @Value("${attachment.upload.path:/home/wzh/codes/uploadFiles}")
    private String uploadBasePath;

    // 允许的文件扩展名
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "txt", "md", "json", "xml", "yaml", "yml", "log", "csv",
            "jpg", "jpeg", "png", "gif", "webp"
    );

    // 文本文件扩展名
    private static final List<String> TEXT_EXTENSIONS = Arrays.asList(
            "txt", "md", "json", "xml", "yaml", "yml", "log", "csv"
    );

    @Override
    public SysAttachment upload(String targetType, String targetId, MultipartFile file, Integer type) {
        // 获取原始文件名和扩展名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new RuntimeException("文件名不能为空");
        }

        String fileExt = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();

        // 校验文件类型
        if (!ALLOWED_EXTENSIONS.contains(fileExt)) {
            throw new RuntimeException("不支持的文件类型: " + fileExt);
        }

        // 创建目标目录
        String targetDir = uploadBasePath + File.separator + targetId;
        File dir = new File(targetDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 生成唯一文件名，保留原始文件名
        String newFileName = UUID.randomUUID().toString().replace("-", "").substring(0, 8) + "_" + originalFilename;
        String filePath = targetDir + File.separator + newFileName;

        // 保存文件
        try {
            file.transferTo(new File(filePath));
        } catch (IOException e) {
            throw new RuntimeException("文件保存失败: " + e.getMessage());
        }

        // 计算MD5
        String md5 = null;
        try {
            byte[] fileBytes = file.getBytes();
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(fileBytes);
            md5 = String.format("%032x", new BigInteger(1, digest));
        } catch (Exception e) {
            // MD5计算失败不影响上传
        }

        // 保存附件记录
        SysAttachment attachment = new SysAttachment();
        attachment.setType(type != null ? type : 1); // 默认为用户上传
        attachment.setTargetType(targetType);
        attachment.setTargetId(targetId);
        attachment.setFileName(originalFilename);
        attachment.setFilePath(filePath);
        attachment.setFileSize(file.getSize());
        attachment.setFileType(file.getContentType());
        attachment.setFileExt(fileExt);
        attachment.setMd5(md5);
        attachment.setSortOrder(0);

        save(attachment);

        return attachment;
    }

    @Override
    public List<SysAttachment> listByTarget(String targetType, String targetId, Integer type) {
        LambdaQueryWrapper<SysAttachment> wrapper = new LambdaQueryWrapper<SysAttachment>()
                .eq(SysAttachment::getTargetType, targetType)
                .eq(SysAttachment::getTargetId, targetId);

        // 如果指定了type，则按type过滤
        if (type != null) {
            wrapper.eq(SysAttachment::getType, type);
        }

        return list(wrapper
                .orderByAsc(SysAttachment::getSortOrder)
                .orderByAsc(SysAttachment::getId));
    }

    @Override
    public void deleteWithFile(Long id) {
        SysAttachment attachment = getById(id);
        if (attachment != null) {
            // 删除物理文件
            File file = new File(attachment.getFilePath());
            if (file.exists()) {
                file.delete();
            }
            // 删除数据库记录
            removeById(id);
        }
    }

    @Override
    public void deleteByTarget(String targetType, String targetId) {
        List<SysAttachment> attachments = listByTarget(targetType, targetId, null);
        for (SysAttachment attachment : attachments) {
            deleteWithFile(attachment.getId());
        }
    }

    @Override
    public String getFileContent(Long id) {
        SysAttachment attachment = getById(id);
        if (attachment == null) {
            throw new RuntimeException("附件不存在");
        }

        String fileExt = attachment.getFileExt().toLowerCase();
        if (!TEXT_EXTENSIONS.contains(fileExt)) {
            throw new RuntimeException("该文件类型不支持文本预览");
        }

        try {
            Path path = Paths.get(attachment.getFilePath());
            return Files.readString(path);
        } catch (IOException e) {
            throw new RuntimeException("读取文件失败: " + e.getMessage());
        }
    }
}
```

**Step 3: 提交服务层修改**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/backend
git add src/main/java/com/qino/log/service/SysAttachmentService.java
git add src/main/java/com/qino/log/service/impl/SysAttachmentServiceImpl.java
git commit -m "feat: add type filter support to SysAttachmentService"
```

---

## Task 4: 后端 - 修改AttachmentController支持type参数

**Files:**
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/backend/src/main/java/com/qino/log/controller/AttachmentController.java`

**Step 1: 修改AttachmentController添加type参数支持**

```java
package com.qino.log.controller;

import com.qino.log.common.Result;
import com.qino.log.entity.SysAttachment;
import com.qino.log.service.SysAttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 附件控制器
 */
@RestController
@RequestMapping("/api/attachment")
public class AttachmentController {

    @Autowired
    private SysAttachmentService attachmentService;

    /**
     * 上传附件
     * @param file 文件
     * @param targetType 目标类型
     * @param targetId 目标ID
     * @param type 附件类型（1.用户上传 2.系统生成），默认为1
     */
    @PostMapping("/upload")
    public Result<SysAttachment> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("targetType") String targetType,
            @RequestParam("targetId") String targetId,
            @RequestParam(value = "type", defaultValue = "1") Integer type) {
        SysAttachment attachment = attachmentService.upload(targetType, targetId, file, type);
        return Result.success(attachment);
    }

    /**
     * 查询附件列表
     * @param targetType 目标类型
     * @param targetId 目标ID
     * @param type 附件类型（可选，1.用户上传 2.系统生成）
     */
    @GetMapping("/list")
    public Result<List<SysAttachment>> list(
            @RequestParam("targetType") String targetType,
            @RequestParam("targetId") String targetId,
            @RequestParam(value = "type", required = false) Integer type) {
        List<SysAttachment> attachments = attachmentService.listByTarget(targetType, targetId, type);
        return Result.success(attachments);
    }

    /**
     * 下载附件
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<FileSystemResource> download(@PathVariable Long id) {
        SysAttachment attachment = attachmentService.getById(id);
        if (attachment == null) {
            return ResponseEntity.notFound().build();
        }

        FileSystemResource resource = new FileSystemResource(attachment.getFilePath());
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String encodedFileName = URLEncoder.encode(attachment.getFileName(), StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                .body(resource);
    }

    /**
     * 预览附件
     */
    @GetMapping("/preview/{id}")
    public Result<Map<String, Object>> preview(@PathVariable Long id) {
        SysAttachment attachment = attachmentService.getById(id);
        if (attachment == null) {
            return Result.error("附件不存在");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("fileName", attachment.getFileName());
        result.put("fileExt", attachment.getFileExt());
        result.put("fileType", attachment.getFileType());

        // 判断是否为图片
        String fileExt = attachment.getFileExt().toLowerCase();
        if (fileExt.equals("jpg") || fileExt.equals("jpeg") || fileExt.equals("png")
                || fileExt.equals("gif") || fileExt.equals("webp")) {
            result.put("type", "image");
            result.put("url", "/api/attachment/download/" + id);
        } else {
            // 文本文件返回内容
            result.put("type", "text");
            result.put("content", attachmentService.getFileContent(id));
        }

        return Result.success(result);
    }

    /**
     * 删除附件
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        attachmentService.deleteWithFile(id);
        return Result.success();
    }
}
```

**Step 2: 提交控制器修改**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/backend
git add src/main/java/com/qino/log/controller/AttachmentController.java
git commit -m "feat: add type parameter support to AttachmentController upload and list APIs"
```

---

## Task 5: 后端 - 修改SystemIssueLogController添加IP获取逻辑

**Files:**
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/backend/src/main/java/com/qino/log/controller/SystemIssueLogController.java`

**Step 1: 修改SystemIssueLogController添加IP获取和审计字段填充**

```java
package com.qino.log.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.qino.log.common.IssueLogQuery;
import com.qino.log.common.Result;
import com.qino.log.entity.SystemIssueLog;
import com.qino.log.req.SystemIssueLogCreateReq;
import com.qino.log.req.SystemIssueLogUpdateReq;
import com.qino.log.service.SystemIssueLogService;
import com.qino.log.vo.SystemIssueLogVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 系统问题日志控制器
 *
 * @author wangzhihao
 */
@RestController
@RequestMapping("/api/issue-log")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SystemIssueLogController {

    private final SystemIssueLogService service;

    /**
     * 分页查询
     */
    @GetMapping("/page")
    public Result<IPage<SystemIssueLogVO>> page(IssueLogQuery query) {
        IPage<SystemIssueLog> entityPage = service.page(query);

        // 转换为VO
        IPage<SystemIssueLogVO> voPage = entityPage.convert(this::toVO);
        return Result.success(voPage, voPage.getTotal());
    }

    /**
     * 根据ID查询
     */
    @GetMapping("/{id}")
    public Result<SystemIssueLogVO> getById(@PathVariable String id) {
        SystemIssueLog log = service.getById(id);
        return log != null ? Result.success(toVO(log)) : Result.error("记录不存在");
    }

    /**
     * 新增
     */
    @PostMapping
    public Result<SystemIssueLogVO> save(@Valid @RequestBody SystemIssueLogCreateReq req, HttpServletRequest request) {
        SystemIssueLog log = new SystemIssueLog();
        BeanUtils.copyProperties(req, log);

        // 设置创建人IP
        log.setCreatorIp(getClientIp(request));

        // 新建时状态默认为待处理
        log.setStatus(1);

        boolean result = service.save(log);
        return result ? Result.success(toVO(log)) : Result.error("新增失败");
    }

    /**
     * 更新
     */
    @PutMapping
    public Result<Void> update(@Valid @RequestBody SystemIssueLogUpdateReq req, HttpServletRequest request) {
        SystemIssueLog log = new SystemIssueLog();
        BeanUtils.copyProperties(req, log);

        // 设置修改人和修改IP
        log.setModifyIp(getClientIp(request));
        log.setModifyAt(LocalDateTime.now());

        return service.updateById(log) ? Result.success() : Result.error("更新失败");
    }

    /**
     * 删除单个
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        return service.removeById(id) ? Result.success() : Result.error("删除失败");
    }

    /**
     * 批量删除
     */
    @DeleteMapping("/batch")
    public Result<Void> deleteBatch(@RequestBody List<String> ids) {
        return service.removeByIds(ids) ? Result.success() : Result.error("批量删除失败");
    }

    /**
     * 实体转VO
     */
    private SystemIssueLogVO toVO(SystemIssueLog entity) {
        SystemIssueLogVO vo = new SystemIssueLogVO();
        BeanUtils.copyProperties(entity, vo);
        return vo;
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 对于多个代理的情况，取第一个IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
```

**Step 2: 提交控制器修改**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/backend
git add src/main/java/com/qino/log/controller/SystemIssueLogController.java
git commit -m "feat: add IP tracking and audit fields to SystemIssueLogController"
```

---

## Task 6: 前端 - 扩展TypeScript类型定义

**Files:**
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/frontend/src/types/index.ts`
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/frontend/src/types/attachment.ts`

**Step 1: 修改SystemIssueLog类型定义**

```typescript
// 系统问题日志类型
export interface SystemIssueLog {
  id?: string
  type: number
  createTableSql?: string
  newRequirement?: string
  beforeTransformation?: string
  transformation?: string
  businessContext: string
  remark?: string
  status: number
  creator?: string
  creatorIp?: string
  createdAt?: string
  modifyUser?: string
  modifyIp?: string
  modifyAt?: string
}
```

**Step 2: 修改SysAttachment类型定义**

```typescript
export interface SysAttachment {
  id?: number
  type?: number  // 类型（1.用户上传 2.系统生成）
  targetType?: string
  targetId?: string
  fileName: string
  filePath?: string
  fileSize?: number
  fileType?: string
  fileExt?: string
  md5?: string
  sortOrder?: number
  remark?: string
  creator?: string
  createTime?: string
  updateTime?: string
  deleted?: number
}

export interface AttachmentPreview {
  fileName: string
  fileExt: string
  fileType: string
  type: 'image' | 'text'
  url?: string
  content?: string
}
```

**Step 3: 提交类型定义修改**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/frontend
git add src/types/index.ts src/types/attachment.ts
git commit -m "feat: add audit fields and type field to TypeScript interfaces"
```

---

## Task 7: 前端 - 修改attachment API支持type参数

**Files:**
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/frontend/src/api/attachment.ts`

**Step 1: 修改attachment API添加type参数**

```typescript
import request from '@/utils/request'
import type { SysAttachment, AttachmentPreview } from '@/types/attachment'

/**
 * 上传附件
 * @param file 文件
 * @param targetType 目标类型
 * @param targetId 目标ID
 * @param type 附件类型（1.用户上传 2.系统生成），默认为1
 */
export function uploadAttachment(
  file: File,
  targetType: string,
  targetId: string,
  type: number = 1
): Promise<{ data: SysAttachment }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('targetType', targetType)
  formData.append('targetId', targetId)
  formData.append('type', type.toString())
  return request.post('/attachment/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 查询附件列表
 * @param targetType 目标类型
 * @param targetId 目标ID
 * @param type 附件类型（可选，1.用户上传 2.系统生成）
 */
export function getAttachmentList(
  targetType: string,
  targetId: string,
  type?: number
): Promise<{ data: SysAttachment[] }> {
  return request.get('/attachment/list', {
    params: { targetType, targetId, type }
  })
}

export function getAttachmentPreview(id: number): Promise<{ data: AttachmentPreview }> {
  return request.get(`/attachment/preview/${id}`)
}

export function getDownloadUrl(id: number): string {
  return `/api/attachment/download/${id}`
}

export function deleteAttachment(id: number): Promise<void> {
  return request.delete(`/attachment/${id}`)
}
```

**Step 2: 提交API修改**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/frontend
git add src/api/attachment.ts
git commit -m "feat: add type parameter to attachment API"
```

---

## Task 8: 前端 - 创建只读附件展示组件AttachmentView

**Files:**
- Create: `/home/wzh/codes/myownWorkspace/system-log-register/frontend/src/components/AttachmentView.vue`

**Step 1: 创建AttachmentView组件（只读模式，用于详情页面）**

```vue
<template>
  <div class="attachment-view">
    <div class="attachment-label">{{ label }}</div>

    <!-- 附件列表 -->
    <div v-if="fileList.length > 0" class="attachment-list">
      <div
        v-for="(file, index) in fileList"
        :key="file.id"
        class="attachment-item"
      >
        <!-- 图片类型 -->
        <div v-if="isImage(file.fileExt)" class="attachment-preview image-preview" @click="handlePreview(file, index)">
          <img :src="getDownloadUrl(file.id!)" alt="preview" />
        </div>

        <!-- 文本文件类型 -->
        <div v-else class="attachment-preview file-preview">
          <el-icon size="32"><Document /></el-icon>
          <span class="file-ext">{{ file.fileExt?.toUpperCase() }}</span>
        </div>

        <div class="attachment-info">
          <div class="file-name" :title="file.fileName">{{ file.fileName }}</div>
          <div class="file-size">{{ formatSize(file.fileSize) }}</div>
        </div>

        <div class="attachment-actions">
          <el-button type="primary" link size="small" @click="handleDownload(file)">
            <el-icon><Download /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="attachment-empty">
      暂无附件
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览" width="800px">
      <img :src="previewImageUrl" style="width: 100%" />
    </el-dialog>

    <!-- 文本预览对话框 -->
    <el-dialog v-model="textPreviewVisible" title="文件预览" width="800px">
      <pre class="text-preview-content">{{ textPreviewContent }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Document } from '@element-plus/icons-vue'
import { getAttachmentList, getAttachmentPreview, getDownloadUrl } from '@/api/attachment'
import type { SysAttachment } from '@/types/attachment'

const props = defineProps<{
  targetType: string
  targetId: string
  type: number  // 1=用户上传, 2=系统生成
  label?: string
}>()

const fileList = ref<SysAttachment[]>([])

const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

const textPreviewVisible = ref(false)
const textPreviewContent = ref('')

// 判断是否为图片
const isImage = (ext?: string) => {
  if (!ext) return false
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())
}

// 格式化文件大小
const formatSize = (bytes?: number) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 预览
const handlePreview = async (file: SysAttachment) => {
  if (!file.id) return

  try {
    const res = await getAttachmentPreview(file.id)
    if (res.data.type === 'image') {
      previewImageUrl.value = res.data.url || ''
      imagePreviewVisible.value = true
    } else {
      textPreviewContent.value = res.data.content || ''
      textPreviewVisible.value = true
    }
  } catch (error) {
    ElMessage.error('预览失败')
  }
}

// 下载
const handleDownload = (file: SysAttachment) => {
  if (!file.id) return
  window.open(getDownloadUrl(file.id), '_blank')
}

// 加载附件列表
const loadAttachments = async () => {
  if (!props.targetId) {
    fileList.value = []
    return
  }

  try {
    const res = await getAttachmentList(props.targetType, props.targetId, props.type)
    fileList.value = res.data || []
  } catch (error) {
    fileList.value = []
  }
}

// 暴露方法给父组件
defineExpose({
  loadAttachments
})

// 监听 targetId 变化
watch(() => props.targetId, (newVal) => {
  if (newVal) {
    loadAttachments()
  } else {
    fileList.value = []
  }
})

onMounted(() => {
  if (props.targetId) {
    loadAttachments()
  }
})
</script>

<style scoped>
.attachment-view {
  margin-bottom: 16px;
}

.attachment-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
  min-width: 250px;
  max-width: 350px;
}

.attachment-preview {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-preview {
  background: #f0f2f5;
  flex-direction: column;
}

.file-ext {
  font-size: 10px;
  color: #909399;
}

.attachment-info {
  flex: 1;
  overflow: hidden;
}

.file-name {
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.attachment-actions {
  display: flex;
  flex-shrink: 0;
}

.attachment-empty {
  color: #909399;
  font-size: 13px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  text-align: center;
}

.text-preview-content {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}
</style>
```

**Step 2: 提交新组件**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/frontend
git add src/components/AttachmentView.vue
git commit -m "feat: create AttachmentView component for read-only attachment display"
```

---

## Task 9: 前端 - 修改AttachmentUpload组件支持type参数

**Files:**
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/frontend/src/components/AttachmentUpload.vue`

**Step 1: 修改AttachmentUpload组件添加type属性**

在script setup部分修改props定义和相关逻辑：

```typescript
const props = defineProps<{
  targetType: string
  targetId: string
  type?: number  // 默认为1（用户上传）
}>()

const attachmentType = computed(() => props.type ?? 1)
```

修改handleFileChange中的上传调用：

```typescript
// 在handleFileChange函数中，将上传调用改为：
if (props.targetId) {
  try {
    const res = await uploadAttachment(file, props.targetType, props.targetId, attachmentType.value)
    fileList.value.push(res.data)
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  }
}
```

修改uploadPendingFiles中的上传调用：

```typescript
// 在uploadPendingFiles函数中，将上传调用改为：
const res = await uploadAttachment(pendingFile.rawFile, props.targetType, targetId, attachmentType.value)
```

修改loadAttachments中的查询调用：

```typescript
// 在loadAttachments函数中，将查询调用改为：
const res = await getAttachmentList(props.targetType, props.targetId, attachmentType.value)
```

**Step 2: 提交组件修改**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/frontend
git add src/components/AttachmentUpload.vue
git commit -m "feat: add type prop to AttachmentUpload component"
```

---

## Task 10: 前端 - 修改IssueLog组件添加详情查看功能

**Files:**
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/frontend/src/components/IssueLog.vue`

**Step 1: 在表格操作列添加"查看"按钮**

修改操作列模板（约第57行）：

```vue
<el-table-column label="操作" width="230" fixed="right">
  <template #default="{ row }">
    <el-button type="primary" link @click="handleView(row)">查看</el-button>
    <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
    <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
  </template>
</el-table-column>
```

**Step 2: 添加详情对话框**

在现有对话框之后添加详情对话框：

```vue
<!-- 查看详情对话框 -->
<el-dialog v-model="viewDialogVisible" title="查看详情" width="650px">
  <el-form :model="viewData" label-width="110px" disabled>
    <!-- 类型 -->
    <el-form-item label="类型">
      <el-select v-model="viewData.type" style="width: 100%" disabled>
        <el-option v-for="item in TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>

    <!-- SQL建表语句 -->
    <el-form-item v-if="viewFieldVisibility.createTableSql" label="SQL建表语句">
      <el-input v-model="viewData.createTableSql" type="textarea" :rows="6" readonly />
    </el-form-item>

    <!-- 新需求描述 -->
    <el-form-item v-if="viewFieldVisibility.newRequirement" label="新需求描述">
      <el-input v-model="viewData.newRequirement" type="textarea" :rows="4" readonly />
    </el-form-item>

    <!-- 改造前功能描述 -->
    <el-form-item v-if="viewFieldVisibility.beforeTransformation" label="改造前功能">
      <el-input v-model="viewData.beforeTransformation" type="textarea" :rows="4" readonly />
    </el-form-item>

    <!-- 改造后的目标 -->
    <el-form-item v-if="viewFieldVisibility.transformation" label="改造后目标">
      <el-input v-model="viewData.transformation" type="textarea" :rows="4" readonly />
    </el-form-item>

    <!-- 业务介绍 -->
    <el-form-item label="业务介绍">
      <el-input v-model="viewData.businessContext" type="textarea" :rows="4" readonly />
    </el-form-item>

    <!-- 状态 -->
    <el-form-item label="状态">
      <el-select v-model="viewData.status" style="width: 100%" disabled>
        <el-option v-for="item in ISSUE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>

    <!-- 备注 -->
    <el-form-item label="备注">
      <el-input v-model="viewData.remark" type="textarea" :rows="3" readonly />
    </el-form-item>

    <!-- 审计信息 -->
    <el-form-item label="创建人">
      <el-input v-model="viewData.creator" readonly />
    </el-form-item>
    <el-form-item label="创建人IP">
      <el-input v-model="viewData.creatorIp" readonly />
    </el-form-item>
    <el-form-item label="创建时间">
      <el-input v-model="viewData.createdAt" readonly />
    </el-form-item>
    <el-form-item v-if="viewData.modifyUser" label="修改人">
      <el-input v-model="viewData.modifyUser" readonly />
    </el-form-item>
    <el-form-item v-if="viewData.modifyIp" label="修改人IP">
      <el-input v-model="viewData.modifyIp" readonly />
    </el-form-item>
    <el-form-item v-if="viewData.modifyAt" label="修改时间">
      <el-input v-model="viewData.modifyAt" readonly />
    </el-form-item>

    <!-- 用户上传附件 -->
    <AttachmentView
      label="附件"
      target-type="system_issue_log"
      :target-id="viewData.id || ''"
      :type="1"
    />

    <!-- 系统生成附件 -->
    <AttachmentView
      label="系统生成附件"
      target-type="system_issue_log"
      :target-id="viewData.id || ''"
      :type="2"
    />
  </el-form>
  <template #footer>
    <el-button @click="viewDialogVisible = false">关闭</el-button>
  </template>
</el-dialog>
```

**Step 3: 在script setup中添加详情相关逻辑**

```typescript
import AttachmentView from './AttachmentView.vue'

// 详情对话框
const viewDialogVisible = ref(false)
const viewData = ref<SystemIssueLog>({} as SystemIssueLog)

// 详情字段显示配置
const viewFieldVisibility = computed(() => {
  const config = getFieldConfig(viewData.value.type || 1)
  return {
    createTableSql: config.createTableSql,
    newRequirement: config.newRequirement,
    beforeTransformation: config.beforeTransformation,
    transformation: config.transformation
  }
})

// 查看详情
const handleView = async (row: SystemIssueLog) => {
  const res = await getIssueLogById(row.id!)
  viewData.value = res.data
  viewDialogVisible.value = true
}
```

**Step 4: 提交IssueLog组件修改**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/frontend
git add src/components/IssueLog.vue
git commit -m "feat: add view details functionality with read-only mode and dual attachment sections"
```

---

## Task 11: 前端 - 修改IssueLog组件新建时默认状态为待处理且只读

**Files:**
- Modify: `/home/wzh/codes/myownWorkspace/system-log-register/frontend/src/components/IssueLog.vue`

**Step 1: 修改handleAdd函数和表单，使新建时状态为待处理且只读**

修改表单中状态字段的条件渲染：

```vue
<!-- 状态 (始终显示，新建时禁用) -->
<el-form-item label="状态" prop="status">
  <el-select
    v-model="formData.status"
    placeholder="请选择状态"
    style="width: 100%"
    :disabled="!formData.id"
  >
    <el-option v-for="item in ISSUE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
  <div v-if="!formData.id" class="status-tip">新建记录时状态默认为"待处理"</div>
</el-form-item>
```

**Step 2: 添加样式**

```css
.status-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
```

**Step 3: 确保handleAdd中状态默认为1**

```typescript
const handleAdd = () => {
  dialogTitle.value = '新增问题'
  formData.value = { type: 1, status: 1, businessContext: '' } as SystemIssueLog
  dialogVisible.value = true
  // 清空附件
  nextTick(() => {
    formRef.value?.clearValidate()
    attachmentRef.value?.loadAttachments()
  })
}
```

**Step 4: 提交修改**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/frontend
git add src/components/IssueLog.vue
git commit -m "feat: make status field read-only when creating new record (default to pending)"
```

---

## Task 12: 集成测试与验证

**Files:**
- Test: Backend - 启动Spring Boot应用
- Test: Frontend - 启动Vite开发服务器

**Step 1: 启动后端服务验证**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/backend
mvn spring-boot:run
```

验证点：
- 应用启动成功
- 数据库表字段正确映射

**Step 2: 启动前端服务验证**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register/frontend
npm run dev
```

验证点：
- 前端启动成功
- 页面正常渲染

**Step 3: 功能测试**

1. 新增记录测试：
   - 状态默认为"待处理"
   - 状态下拉框禁用
   - 创建后creatorIp有值

2. 编辑记录测试：
   - 状态可以修改
   - 修改后modifyUser、modifyIp、modifyAt有值

3. 查看详情测试：
   - 所有字段只读
   - 用户上传附件区域显示type=1的附件
   - 系统生成附件区域显示type=2的附件
   - 可以预览和下载附件

4. 附件上传测试：
   - 用户上传的附件type=1

**Step 4: 最终提交**

```bash
cd /home/wzh/codes/myownWorkspace/system-log-register
git add -A
git commit -m "feat: complete system issue log enhancement with audit fields and dual attachment sections"
```

---

## 执行摘要

| 任务 | 描述 | 文件数 |
|------|------|--------|
| Task 1 | 后端扩展SystemIssueLog实体 | 4 |
| Task 2 | 后端扩展SysAttachment实体 | 1 |
| Task 3 | 后端修改SysAttachmentService | 2 |
| Task 4 | 后端修改AttachmentController | 1 |
| Task 5 | 后端修改SystemIssueLogController | 1 |
| Task 6 | 前端扩展TypeScript类型 | 2 |
| Task 7 | 前端修改attachment API | 1 |
| Task 8 | 前端创建AttachmentView组件 | 1 |
| Task 9 | 前端修改AttachmentUpload组件 | 1 |
| Task 10 | 前端添加详情查看功能 | 1 |
| Task 11 | 前端新建时状态只读 | 1 |
| Task 12 | 集成测试与验证 | - |

**总计:** 修改15个文件，创建1个新文件，12个任务
