package com.ismagi.equipment.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

    private final Path equipmentsUploadDir;
    private final String equipmentPublicPrefix;

    public FileStorageService(
            @Value("${app.upload.root-dir:uploads}") String uploadRootDir,
            @Value("${app.upload.equipment-public-prefix:/uploads/equipments/}") String equipmentPublicPrefix
    ) {
        this.equipmentsUploadDir = Paths.get(uploadRootDir, "equipments").toAbsolutePath().normalize();
        this.equipmentPublicPrefix = equipmentPublicPrefix.endsWith("/")
                ? equipmentPublicPrefix
                : equipmentPublicPrefix + "/";
        try {
            Files.createDirectories(this.equipmentsUploadDir);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to initialize upload directory", ex);
        }
    }

    public String storeEquipmentImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !contentType.toLowerCase().startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        String extension = extractAndValidateExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + extension;
        Path targetFile = this.equipmentsUploadDir.resolve(fileName).normalize();

        if (!targetFile.startsWith(this.equipmentsUploadDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        try {
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to store image", ex);
        }

        return equipmentPublicPrefix + fileName;
    }

    public void deleteEquipmentImage(String publicPath) {
        if (!StringUtils.hasText(publicPath) || !publicPath.startsWith(equipmentPublicPrefix)) {
            return;
        }

        String fileName = publicPath.substring(equipmentPublicPrefix.length());
        Path targetFile = this.equipmentsUploadDir.resolve(fileName).normalize();

        if (!targetFile.startsWith(this.equipmentsUploadDir)) {
            return;
        }

        try {
            Files.deleteIfExists(targetFile);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to delete image", ex);
        }
    }

    private String extractAndValidateExtension(String originalFilename) {
        String cleanedName = StringUtils.cleanPath(originalFilename == null ? "" : originalFilename);
        int dotIndex = cleanedName.lastIndexOf('.');
        if (dotIndex < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image extension is required");
        }

        String extension = cleanedName.substring(dotIndex).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported image extension");
        }

        return extension;
    }
}
